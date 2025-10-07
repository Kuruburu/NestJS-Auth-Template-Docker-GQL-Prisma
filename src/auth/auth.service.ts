import { PrismaService } from 'nestjs-prisma';
import { Role } from '@prisma/client';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './password.service';
import { SignupInput } from './dto/signup.input';
import { Token } from './models/token.model';
import { SecurityConfig } from '../common/configs/config.interface';
import { JwtDto } from './dto/jwt.dto';
import { randomBytes } from 'crypto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { SafeUser, UsersService } from 'src/users/users.service';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { UserDto } from 'src/users/dto/user.dto';
import { plainToInstance } from 'class-transformer';
import { CreateUser } from 'src/users/interfaces/create-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) { }

  async signUp(signupInput: SignupInput): Promise<Token> {
    const user = await this.userService.create({
      ...signupInput,
      provider: 'LOCAL',
      providerId: 'LOCAL',
      role: 'USER',
    });
    return await this.generateTokens({ sub: user.id, role: user.role }, false);
  }

  async login(user: UserDto, rememberMe?: boolean): Promise<Token> {
    return await this.generateTokens({ sub: user.id, role: user.role }, rememberMe ?? false);
  }

  async validateUser(email: string, password: string): Promise<UserDto | null> {
    const user = await this.userService.findOneByEmailWithPassword(email);

    if (!user) return null;

    const passwordValid = await this.passwordService.validatePassword(password, user.passwordHash);

    if (passwordValid) return plainToInstance(UserDto, user);
    else return null;
  }

  async validateUserById(userId: number): Promise<SafeUser | null> {
    return await this.userService.findOne(userId);
  }

  async validateProvidedUser(createUser: Omit<CreateUser, 'password' | 'role'>): Promise<SafeUser> {
    const { provider, providerId, email } = createUser;
    const userWithProviders = await this.userService.findProvidedUser(email);
    if (userWithProviders === null) {
      try {
        const randomPassword = randomBytes(64).toString('hex');
        const newUser: CreateUser = { ...createUser, password: randomPassword, role: 'USER' };
        return await this.userService.create(newUser);
      } catch (error) {
        throw new UnauthorizedException('there was a problem creating new provided user', String(error));
      }
    }
    const hasProvider = userWithProviders.userProviders.some(
      (up) => up.provider === provider && up.providerId === providerId,
    );
    if (!hasProvider) {
      try {
        await this.userService.createUserProvider({ provider, providerId, userId: userWithProviders.user.id });
        return userWithProviders.user;
      } catch (error) {
        throw new UnauthorizedException('there was a problem linking provider to existing user', String(error));
      }
    }
    return userWithProviders.user;
  }

  async getUserFromToken(token: string): Promise<SafeUser | null> {
    const payload: JwtDto | null = this.jwtService.decode(token);

    if (!payload || typeof payload.sub !== 'number') {
      return null; // invalid or malformed token
    }
    return await this.userService.findOne(payload.sub);
  }

  async generateTokens(payload: JwtPayloadDto, isRefreshTokenLongLived: boolean): Promise<Token> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload.sub, isRefreshTokenLongLived),
    ]);
    return {
      accessToken,
      ...refreshToken,
    };
  }

  async rotateTokens({ refreshToken: oldToken, refreshTokenId }: RefreshTokenInput): Promise<Token> {
    const [accessToken, refreshToken] = await Promise.all([
      await this.refreshAccessToken(refreshTokenId, oldToken),
      await this.rotateRefreshToken(refreshTokenId),
    ]);
    return { accessToken, ...refreshToken };
  }

  async generateAccessToken(payload: { sub: number; role: Role }): Promise<string> {
    try {
      return await this.jwtService.signAsync(payload);
    } catch (error) {
      throw new InternalServerErrorException(error, 'There was a problem generating access token.');
    }
  }

  async generateRefreshToken(
    userId: number,
    shortLived: boolean,
  ): Promise<{ refreshToken: string; refreshTokenId: string }> {
    const refreshToken = randomBytes(64).toString('hex');
    const { refreshTokenExpirationInDays, refreshTokenShortExpirationInHours } =
      this.configService.getOrThrow<SecurityConfig>('security');
    const expiresIn = shortLived ? refreshTokenShortExpirationInHours : refreshTokenExpirationInDays * 24;
    const expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000).toISOString();

    try {
      const hashedToken = await this.passwordService.hashPassword(refreshToken);
      const dbToken = await this.prisma.refreshToken.create({
        data: {
          tokenHash: hashedToken,
          userId: userId,
          expiresAt,
        },
      });
      return { refreshToken, refreshTokenId: dbToken.id };
    } catch (error) {
      throw new InternalServerErrorException(error, 'There was a problem when generating a refreshToken.');
    }
  }

  async rotateRefreshToken(oldRefreshTokenId: string) {
    const refreshToken1 = await this.prisma.refreshToken.findUnique({
      where: { id: oldRefreshTokenId },
    });
    if (!refreshToken1) throw new NotFoundException('Old token not found.');
    const { revokedAt, expiresAt, userId } = refreshToken1;
    if (revokedAt) throw new ForbiddenException('Refresh token already revoked');

    const refreshToken = randomBytes(64).toString('hex');
    const hashedToken = await this.passwordService.hashPassword(refreshToken);

    try {
      const refreshTokenId = await this.prisma.$transaction(async (tx) => {
        const dbToken = await tx.refreshToken.create({
          data: { tokenHash: hashedToken, userId, expiresAt },
        });
        await tx.refreshToken.update({
          where: { id: oldRefreshTokenId },
          data: { replacedByTokenId: dbToken.id, revokedAt: new Date() },
        });
        return dbToken.id;
      });

      return { refreshToken, refreshTokenId };
    } catch (error) {
      throw new InternalServerErrorException(error, 'There was a problem when revoking a refresh token.');
    }
  }

  async refreshAccessToken(tokenId: string, token: string): Promise<string> {
    try {
      const { tokenHash, userId, user } = await this.prisma.refreshToken.findUniqueOrThrow({
        where: { id: tokenId },
        include: { user: true },
      });
      const doesTokensMatch = await this.passwordService.validatePassword(token, tokenHash);

      if (!doesTokensMatch) {
        throw new UnauthorizedException('Refresh tokens do not match.');
      }
      return await this.generateAccessToken({ sub: userId, role: user.role });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Refresh token not found.');
      }
      throw new UnauthorizedException(error, 'There was a problem refreshing access token.');
    }
  }
}
