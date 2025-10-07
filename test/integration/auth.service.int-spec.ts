import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { faker } from '@faker-js/faker/.';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import { RefreshTokenInput } from 'src/auth/dto/refresh-token.input';
import { SignupInput } from 'src/auth/dto/signup.input';
import { PasswordService } from 'src/auth/password.service';

const userArray: User[] = [
  {
    id: 4,
    email: 'test@test.com',
    firstName: 'Alice',
    lastName: 'Smith',
    passwordHash: 'password',
    role: 'USER',
    createdAt: faker.defaultRefDate(),
    updatedAt: faker.defaultRefDate(),
  },
  {
    id: 1,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    createdAt: faker.defaultRefDate(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    role: 'USER',
    updatedAt: faker.defaultRefDate(),
  },

  {
    id: 2,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    createdAt: faker.defaultRefDate(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    role: 'USER',
    updatedAt: faker.defaultRefDate(),
  },
  {
    id: 3,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    createdAt: faker.defaultRefDate(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    role: 'USER',
    updatedAt: faker.defaultRefDate(),
  },
];

const mockUser = userArray[0];

describe('AuthService', () => {
  let jwtService: JwtService;
  let authService: AuthService;
  let prisma: PrismaService;
  let passwordService: PasswordService;
  let configService: ConfigService;
  let userService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [AuthService, PrismaService, UsersService, ConfigService, PasswordService, JwtService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    passwordService = module.get<PasswordService>(PasswordService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    userService = module.get<UsersService>(UsersService);
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('signUp', () => {
    const user: SignupInput = {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: faker.internet.password(),
    };
    it('should return tokens if successfully created user', async () => {
      jest.spyOn(userService, 'create').mockResolvedValue(mockUser);
      const mockTokens = { accessToken: 'fake', refreshToken: 'fake', refreshTokenId: '123' };
      jest.spyOn(authService, 'generateTokens').mockResolvedValue(mockTokens);

      const result = await authService.signUp(user);

      expect(authService.generateTokens).toHaveBeenCalledWith({ sub: mockUser.id, role: mockUser.role }, false);
      expect(result).toEqual(mockTokens);
    });
    it('should throw ConflictException if email is taken', async () => {
      jest.spyOn(userService, 'create').mockRejectedValue(new ConflictException('Conflict'));

      await expect(authService.signUp(user)).rejects.toThrow(ConflictException);
      await expect(authService.signUp(user)).rejects.toThrow('Conflict');
      // jest.spyOn(userService, 'create').mockRejectedValue(ConflictException);
      //
      // await expect(authService.signUp(user)).rejects.toThrow(new ConflictException());
    });
  });

  describe('login', () => {
    it('should return tokens if login is successful', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(passwordService, 'validatePassword').mockResolvedValue(true);
      jest.spyOn(authService, 'generateTokens').mockResolvedValue({
        accessToken: 'fake',
        refreshToken: 'fake',
        refreshTokenId: 'dummy-id',
      });

      const result = await authService.login({ email: mockUser.email, password: 'password', rememberMe: true });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshTokenId).toBeDefined();
      expect(userService.findOneByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(passwordService.validatePassword).toHaveBeenCalledWith('password', mockUser.passwordHash);
    });

    it('should throw error NotFoundException if the email is invalid', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockRejectedValue(new NotFoundException());
      await expect(
        authService.login({ email: mockUser.email, password: 'password', rememberMe: true }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if password do not match', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(passwordService, 'validatePassword').mockResolvedValue(false);

      await expect(
        authService.login({ email: mockUser.email, password: 'password', rememberMe: true }),
      ).rejects.toThrow(BadRequestException);

      expect(userService.findOneByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(passwordService.validatePassword).toHaveBeenCalledWith('password', mockUser.passwordHash);
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials match', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(passwordService, 'validatePassword').mockResolvedValue(true);
      jest.spyOn(authService, 'generateTokens').mockResolvedValue({
        accessToken: 'fake',
        refreshToken: 'fake',
        refreshTokenId: 'dummy-id',
      });

      const result = await authService.login({ email: mockUser.email, password: 'password', rememberMe: true });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshTokenId).toBeDefined();
      expect(userService.findOneByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(passwordService.validatePassword).toHaveBeenCalledWith('password', mockUser.passwordHash);
    });

    it('should return null if ', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockRejectedValue(new NotFoundException());
      await expect(
        authService.login({ email: mockUser.email, password: 'password', rememberMe: true }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if password do not match', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(passwordService, 'validatePassword').mockResolvedValue(false);

      await expect(
        authService.login({ email: mockUser.email, password: 'password', rememberMe: true }),
      ).rejects.toThrow(BadRequestException);

      expect(userService.findOneByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(passwordService.validatePassword).toHaveBeenCalledWith('password', mockUser.passwordHash);
    });
  });

  describe('validateUserById', () => {
    it('should return a user if found', async () => {
      const user: User = { id: 1, email: 'test@test.com' } as User;
      mockUserService.findOne.mockResolvedValue(user);

      const result = await authService.validateUserById(1);

      expect(result).toEqual(user);
      expect(userService.findOne).toHaveBeenCalledWith(1);
    });

    it('should return null if user not found', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      const result = await authService.validateUserById(999);

      expect(result).toBeNull();
      expect(userService.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('getUserFromToken', () => {
    it('should return a user if token is valid and user exists', async () => {
      const token = 'valid.token';
      const payload = { sub: 1, email: 'test@test.com' };
      const user: User = { id: 1, email: 'test@test.com' } as User;

      (jwtService.decode as jest.Mock).mockReturnValue(payload);
      mockUserService.findOne.mockResolvedValue(user);

      const result = await authService.getUserFromToken(token);

      expect(jwtService.decode).toHaveBeenCalledWith(token);
      expect(userService.findOne).toHaveBeenCalledWith(payload.sub);
      expect(result).toEqual(user);
    });

    it('should return null if token is valid but user not found', async () => {
      const token = 'valid.token';
      const payload = { sub: 999 };
      (jwtService.decode as jest.Mock).mockReturnValue(payload);
      mockUserService.findOne.mockResolvedValue(null);

      const result = await authService.getUserFromToken(token);

      expect(jwtService.decode).toHaveBeenCalledWith(token);
      expect(userService.findOne).toHaveBeenCalledWith(payload.sub);
      expect(result).toBeNull();
    });
    it('should return null if token is invalid or malformed', async () => {
      const token = 'bad.token';
      (jwtService.decode as jest.Mock).mockReturnValue(null);

      const result = await authService.getUserFromToken(token);

      expect(jwtService.decode).toHaveBeenCalledWith(token);
      expect(userService.findOne).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('generateAccessToken', () => {
    it('should return a signed access token when jwtService.signAsync succeeds', async () => {
      const payload = { sub: 1, role: Role.USER };
      (jwtService.signAsync as jest.Mock).mockResolvedValue('signed-token');

      const result = await authService.generateAccessToken(payload);

      expect(jwtService.signAsync).toHaveBeenCalledWith(payload);
      expect(result).toBe('signed-token');
    });

    it('should throw InternalServerErrorException when jwtService.signAsync fails', async () => {
      const payload = { sub: 1, role: Role.USER };
      (jwtService.signAsync as jest.Mock).mockRejectedValue(new Error('sign failed'));

      await expect(authService.generateAccessToken(payload)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a short-lived refresh token with correct expiration', async () => {
      configService.getOrThrow.mockReturnValue({
        refreshTokenExpirationInDays: 7,
        refreshTokenShortExpirationInHours: 2,
      });
      passwordService.hashPassword.mockResolvedValue('hashed-fixed-token');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({ id: 'db-token-id' });

      const result = await authService.generateRefreshToken(1, true);

      expect(passwordService.hashPassword).toHaveBeenCalledWith(expect.any(String)); // "fixed-token" hex

      expect(prisma.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            tokenHash: expect.any(String) as string,
            userId: 1,
            expiresAt: expect.any(String) as string,
          }),
        }),
      );
      expect(result).toEqual({ refreshToken: expect.any(String) as string, refreshTokenId: 'db-token-id' });
    });

    it('should generate a long-lived refresh token with correct expiration', async () => {
      configService.getOrThrow.mockReturnValue({
        refreshTokenExpirationInDays: 7,
        refreshTokenShortExpirationInHours: 2,
      });
      passwordService.hashPassword.mockResolvedValue('hashed-fixed-token');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({ id: 'db-token-id' });

      const result = await authService.generateRefreshToken(42, false);

      expect(prisma.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            userId: 42,
          }),
        }),
      );
      expect(result.refreshTokenId).toBe('db-token-id');
    });

    it('should throw InternalServerErrorException if hashing fails', async () => {
      configService.getOrThrow.mockReturnValue({
        refreshTokenExpirationInDays: 7,
        refreshTokenShortExpirationInHours: 2,
      });
      passwordService.hashPassword.mockRejectedValue(new Error('hash fail'));

      await expect(authService.generateRefreshToken(1, true)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException if DB create fails', async () => {
      configService.getOrThrow.mockReturnValue({
        refreshTokenExpirationInDays: 7,
        refreshTokenShortExpirationInHours: 2,
      });
      passwordService.hashPassword.mockResolvedValue('hashed-fixed-token');
      (prisma.refreshToken.create as jest.Mock).mockRejectedValue(new Error('db fail'));

      await expect(authService.generateRefreshToken(1, true)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new access token when refresh token is valid', async () => {
      (prisma.refreshToken.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        tokenHash: 'hashed-token',
        userId: 1,
        user: { id: 1, role: 'USER' },
      } as any);

      passwordService.validatePassword.mockResolvedValue(true);
      (jwtService.signAsync as jest.Mock).mockResolvedValue('new-access-token');

      const result = await authService.refreshAccessToken('token-id', 'raw-token');

      expect(prisma.refreshToken.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'token-id' },
        include: { user: true },
      });
      expect(passwordService.validatePassword).toHaveBeenCalledWith('raw-token', 'hashed-token');
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 1, role: 'USER' });
      expect(result).toBe('new-access-token');
    });

    it('should throw UnauthorizedException if tokens do not match', async () => {
      (prisma.refreshToken.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        tokenHash: 'hashed-token',
        userId: 1,
        user: { id: 1, role: 'USER' },
      } as any);

      passwordService.validatePassword.mockResolvedValue(false);

      await expect(authService.refreshAccessToken('token-id', 'wrong-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if refresh token does not exist', async () => {
      (prisma.refreshToken.findUniqueOrThrow as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Not found', {
          code: 'P2025',
          clientVersion: '4.0.0',
        }),
      );

      await expect(authService.refreshAccessToken('bad-id', 'any-token')).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException for unexpected errors', async () => {
      (prisma.refreshToken.findUniqueOrThrow as jest.Mock).mockRejectedValue(new Error('DB is down'));

      await expect(authService.refreshAccessToken('id', 'token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('rotateRefreshToken', () => {
    it('should rotate a valid refresh token and return new token + id', async () => {
      const mockOldToken = { revokedAt: null, expiresAt: '2099-01-01T00:00:00.000Z', userId: 1 };
      const mockNewToken = { id: 'new-refresh-id' };

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(mockOldToken);
      passwordService.hashPassword.mockResolvedValue('hashed-new-token');
      prisma.$transaction.mockImplementation((cb: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return cb({
          refreshToken: {
            create: jest.fn().mockResolvedValue(mockNewToken),
            update: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const result = await authService.rotateRefreshToken('old-id');

      expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({ where: { id: 'old-id' } });
      expect(passwordService.hashPassword).toHaveBeenCalledWith(expect.any(String));
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual({
        refreshToken: expect.any(String) as string, // random hex string
        refreshTokenId: 'new-refresh-id',
      });
    });

    it('should throw ForbiddenException if token already revoked', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        revokedAt: new Date(),
        expiresAt: '2099-01-01T00:00:00.000Z',
        userId: 1,
      });

      await expect(authService.rotateRefreshToken('old-id')).rejects.toThrow(ForbiddenException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if token does not exist', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.rotateRefreshToken('missing-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on unexpected DB error', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockRejectedValue(new InternalServerErrorException());

      await expect(authService.rotateRefreshToken('old-id')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('generateTokens', () => {
    it('should return access and refresh tokens', async () => {
      const mockPayload: JwtPayloadDto = { sub: 1, role: 'USER' };
      const mockAccessToken = 'access-token';
      const mockRefresh = { refreshToken: 'refresh-token', refreshTokenId: 'refresh-id' };

      jest.spyOn(authService, 'generateAccessToken').mockResolvedValue(mockAccessToken);
      jest.spyOn(authService, 'generateRefreshToken').mockResolvedValue(mockRefresh);

      const result = await authService.generateTokens(mockPayload, true);

      expect(authService.generateAccessToken).toHaveBeenCalledWith(mockPayload);
      expect(authService.generateRefreshToken).toHaveBeenCalledWith(mockPayload.sub, true);
      expect(result).toEqual({
        accessToken: mockAccessToken,
        ...mockRefresh,
      });
    });

    it('should propagate errors from generateAccessToken', async () => {
      jest.spyOn(authService, 'generateAccessToken').mockRejectedValue(new Error('sign error'));

      await expect(authService.generateTokens({ sub: 1, role: 'USER' }, true)).rejects.toThrow('sign error');
    });

    it('should propagate errors from generateRefreshToken', async () => {
      jest.spyOn(authService, 'generateAccessToken').mockResolvedValue('access-token');
      jest.spyOn(authService, 'generateRefreshToken').mockRejectedValue(new Error('db error'));

      await expect(authService.generateTokens({ sub: 1, role: 'USER' }, false)).rejects.toThrow('db error');
    });
  });

  describe('rotateTokens', () => {
    const refreshTokenInput: RefreshTokenInput = { refreshToken: 'old-token', refreshTokenId: 'old-id' };
    it('should return new access and refresh tokens', async () => {
      const mockAccessToken = 'new-access-token';
      const mockRefresh = { refreshToken: 'rotated-token', refreshTokenId: 'rotated-id' };

      jest.spyOn(authService, 'refreshAccessToken').mockResolvedValue(mockAccessToken);
      jest.spyOn(authService, 'rotateRefreshToken').mockResolvedValue(mockRefresh);

      const result = await authService.rotateTokens(refreshTokenInput);

      expect(authService.refreshAccessToken).toHaveBeenCalledWith(
        refreshTokenInput.refreshTokenId,
        refreshTokenInput.refreshToken,
      );
      expect(authService.rotateRefreshToken).toHaveBeenCalledWith('old-id');
      expect(result).toEqual({
        accessToken: mockAccessToken,
        ...mockRefresh,
      });
    });

    it('should propagate errors from refreshAccessToken', async () => {
      jest.spyOn(authService, 'refreshAccessToken').mockRejectedValue(new Error('invalid refresh'));

      await expect(authService.rotateTokens(refreshTokenInput)).rejects.toThrow('invalid refresh');
    });

    it('should propagate errors from rotateRefreshToken', async () => {
      jest.spyOn(authService, 'refreshAccessToken').mockResolvedValue('access-token');
      jest.spyOn(authService, 'rotateRefreshToken').mockRejectedValue(new Error('db error'));

      await expect(authService.rotateTokens(refreshTokenInput)).rejects.toThrow('db error');
    });
  });
});
