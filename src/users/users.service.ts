import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma, Provider, User, UserProvider } from '@prisma/client';
import { UpdateUserInput } from './dto/update-user.input';
import { PasswordService } from 'src/auth/password.service';
import { capitalizeFirstLetter } from 'src/common/helpers/stringHelper';
import { CreateUser } from './interfaces/create-user';
import { CreateUserProvider } from './interfaces/create-user-provider';

export type SafeUser = Omit<User, 'passwordHash'>;
export type UserWithProviders = { userProviders: UserProvider[]; user: SafeUser };

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async findAll(): Promise<SafeUser[]> {
    try {
      return await this.prisma.user.findMany({ omit: { passwordHash: true } });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new InternalServerErrorException('Failed to fetch users', error);
    }
  }

  async findOne(id: number): Promise<SafeUser | null> {
    return await this.prisma.user.findUnique({ where: { id }, omit: { passwordHash: true } });
  }

  async findOneOrThrow(id: number): Promise<SafeUser> {
    try {
      return await this.prisma.user.findUniqueOrThrow({ where: { id }, omit: { passwordHash: true } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        // Record not found
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async findOneByEmail(email: string): Promise<SafeUser | null> {
    return await this.prisma.user.findFirst({
      where: {
        email: {
          equals: email.toLowerCase(),
          mode: 'insensitive',
        },
      },
      omit: { passwordHash: true },
    });
  }

  async findProvidedUser(email: string): Promise<UserWithProviders | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: email.toLowerCase(),
          mode: 'insensitive',
        },
      },
      include: { UserProvider: true },
      omit: { passwordHash: true },
    });
    if (user === null) return null;
    const { UserProvider, ...safeUser } = user;
    return { userProviders: UserProvider, user: safeUser };
  }

  async findOneByEmailWithPassword(email: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: {
        email: {
          equals: email.toLowerCase(),
          mode: 'insensitive',
        },
      },
    });
  }
  async findOneByEmailOrThrow(email: string): Promise<SafeUser> {
    try {
      return await this.prisma.user.findFirstOrThrow({
        where: {
          email: {
            contains: email.toLowerCase(),
            mode: 'insensitive',
          },
        },
        omit: { passwordHash: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        // Record not found
        throw new NotFoundException(`User with email ${email} not found`);
      }
      throw new InternalServerErrorException(`Failed to fetch user ${error}`);
    }
  }
  async createUserProvider({ provider, providerId, userId }: CreateUserProvider) {
    return await this.prisma.userProvider.create({
      data: {
        provider,
        providerId,
        userId,
      },
    });
  }
  async getProvidedUser(provider: Provider, providerId: string): Promise<SafeUser | null> {
    const record = await this.prisma.userProvider.findFirst({
      where: { providerId: providerId, provider: provider },
      select: { user: { omit: { passwordHash: true } } },
    });
    return record?.user || null;
  }

  async create(createUserInput: CreateUser): Promise<SafeUser> {
    const { email, firstName, lastName, role, password, providerId, provider } = createUserInput;
    const normalizedPayload = {
      email: email.toLowerCase(),
      firstName: capitalizeFirstLetter(firstName),
      lastName: capitalizeFirstLetter(lastName),
      role,
    };
    try {
      const passwordHash = await this.passwordService.hashPassword(password);
      return await this.prisma.user.create({
        data: { passwordHash, ...normalizedPayload, UserProvider: { create: { provider, providerId } } },
        omit: { passwordHash: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Email ${normalizedPayload.email} already used.`);
      }
      throw new InternalServerErrorException(error);
    }
  }

  async update(updateUserInput: UpdateUserInput): Promise<SafeUser> {
    try {
      return await this.prisma.user.update({
        where: { id: updateUserInput.id },
        data: updateUserInput,
        omit: { passwordHash: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`User with ID ${updateUserInput.id} not found`);
        }
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: number): Promise<SafeUser> {
    try {
      return await this.prisma.user.delete({ where: { id }, omit: { passwordHash: true } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
