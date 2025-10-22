import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Provider, User, UserProvider } from '@prisma/client';
import { UpdateUserInput } from './dto/update-user.input';
import { PasswordService } from 'src/auth/password.service';
import { capitalizeFirstLetter } from 'src/common/helpers/stringHelper';
import { CreateUser } from './interfaces/create-user';
import { CreateUserProvider } from './interfaces/create-user-provider';
import {
  CatchBaseCreateError,
  CatchBaseFindOrThrowError,
  CatchBaseRemoveError,
  CatchBaseUpdateError,
} from 'src/common/helpers/baseErrorHelper';

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
      throw new InternalServerErrorException('Failed to fetch users', { cause: error });
    }
  }

  async findOne(id: string): Promise<SafeUser | null> {
    return await this.prisma.user.findUnique({ where: { id }, omit: { passwordHash: true } });
  }

  async findOneOrThrow(id: string): Promise<SafeUser> {
    try {
      return await this.prisma.user.findUniqueOrThrow({ where: { id }, omit: { passwordHash: true } });
    } catch (error) {
      return CatchBaseFindOrThrowError(error, 'User', id);
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
      where: { email: { equals: email.toLowerCase(), mode: 'insensitive' } },
    });
  }
  async findOneByEmailOrThrow(email: string): Promise<SafeUser> {
    try {
      return await this.prisma.user.findFirstOrThrow({
        where: { email: { contains: email.toLowerCase(), mode: 'insensitive' } },
        omit: { passwordHash: true },
      });
    } catch (error) {
      return CatchBaseFindOrThrowError(error, 'User', { email: email });
    }
  }
  async createUserProvider({ provider, providerId, userId }: CreateUserProvider) {
    try {
      return await this.prisma.userProvider.create({ data: { provider, providerId, userId } });
    } catch (error) {
      return CatchBaseCreateError(error, 'UserProvider', { identifier: providerId });
    }
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
      return CatchBaseCreateError(error, 'User', { identifier: { email: normalizedPayload.email } });
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
      return CatchBaseUpdateError(error, 'User', updateUserInput.id);
    }
  }

  async remove(id: string): Promise<SafeUser> {
    try {
      return await this.prisma.user.delete({ where: { id }, omit: { passwordHash: true } });
    } catch (error) {
      return CatchBaseRemoveError(error, 'User', id);
    }
  }
}
