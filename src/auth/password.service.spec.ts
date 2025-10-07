import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { ConfigService } from '@nestjs/config';
import { PasswordService } from './password.service';
import { hash, compare } from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('PasswordService', () => {
  let service: PasswordService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordService,
        PrismaService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('bcryptSaltRounds', () => {
    it('should return a number when security config is defined', () => {
      (configService.get as jest.Mock).mockReturnValue({ bcryptSaltOrRound: 10 });

      expect(service.bcryptSaltRounds).toBe(10);
    });

    it('should throw an error when security config is undefined', () => {
      (configService.get as jest.Mock).mockReturnValue(undefined);

      expect(() => service.bcryptSaltRounds).toThrow('SecurityConfig not defined');
    });

    it('should return a string if bcryptSaltOrRound is not a number', () => {
      (configService.get as jest.Mock).mockReturnValue({ bcryptSaltOrRound: 'my-salt' });

      expect(service.bcryptSaltRounds).toBe('my-salt');
    });
  });

  describe('hashPassword', () => {
    it('should call bcrypt.hash with password and salt rounds', async () => {
      (configService.get as jest.Mock).mockReturnValue({ bcryptSaltOrRound: 10 });
      (hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.hashPassword('my-password');

      expect(hash).toHaveBeenCalledWith('my-password', 10);
      expect(result).toBe('hashed-password');
    });
  });

  describe('validatePassword', () => {
    it('should call bcrypt.compare and return true if passwords match', async () => {
      (compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword('plain', 'hashed');

      expect(compare).toHaveBeenCalledWith('plain', 'hashed');
      expect(result).toBe(true);
    });

    it('should return false if passwords do not match', async () => {
      (compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword('plain', 'hashed');

      expect(result).toBe(false);
    });
  });
});
