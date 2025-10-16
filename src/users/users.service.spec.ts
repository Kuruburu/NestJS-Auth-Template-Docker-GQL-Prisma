import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'nestjs-prisma';
import { Prisma, User, UserProvider } from '@prisma/client';
import { faker } from '@faker-js/faker/.';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import { PasswordService } from 'src/auth/password.service';
// import {User} from '@prisma/client';

const userArray: User[] = [
  {
    id: '0accb717-3a29-441c-8c01-136644e6cf97',
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    role: 'USER',

    createdAt: faker.defaultRefDate(),
    updatedAt: faker.defaultRefDate(),
  },

  {
    id: '1f9c188f-02b8-4361-8de7-fa0670e9d454',
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    role: 'USER',

    createdAt: faker.defaultRefDate(),
    updatedAt: faker.defaultRefDate(),
  },
  {
    id: '86d62dbd-07ba-44e5-9853-878624cc568d',
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    role: 'USER',

    createdAt: faker.defaultRefDate(),
    updatedAt: faker.defaultRefDate(),
  },
];

const userProviderArray: UserProvider[] = [
  {
    id: 1,
    provider: 'LOCAL',
    providerId: 'local-1',
    userId: '0accb717-3a29-441c-8c01-136644e6cf97',

    createdAt: faker.defaultRefDate(),
    updatedAt: faker.defaultRefDate(),
  },
  {
    id: 2,
    provider: 'GOOGLE',
    providerId: '75eac49f-4df3-45f6-90a8-cb437e3428c2',
    userId: '0accb717-3a29-441c-8c01-136644e6cf97',

    createdAt: faker.defaultRefDate(),
    updatedAt: faker.defaultRefDate(),
  },
  {
    id: 3,
    provider: 'APPLE',
    providerId: '70cd658d-c3f0-49b3-b5a8-2ea851f6a91f',
    userId: '0accb717-3a29-441c-8c01-136644e6cf97',

    createdAt: faker.defaultRefDate(),
    updatedAt: faker.defaultRefDate(),
  },
  {
    id: 4,
    provider: 'APPLE',
    providerId: 'e4718e3b-4a9d-420a-856e-6f50b39a2fa9',
    userId: '1f9c188f-02b8-4361-8de7-fa0670e9d454',

    createdAt: faker.defaultRefDate(),
    updatedAt: faker.defaultRefDate(),
  },
];

const oneUser = userArray[0];
const db = {
  user: {
    findMany: jest.fn().mockResolvedValue(userArray),
    findUnique: jest.fn().mockResolvedValue(oneUser),
    findUniqueOrThrow: jest.fn().mockResolvedValue(oneUser),
    findOne: jest.fn().mockResolvedValue(oneUser),
    findFirst: jest.fn().mockResolvedValue(oneUser),
    findFirstOrThrow: jest.fn().mockResolvedValue(oneUser),
    save: jest.fn(),
    update: jest.fn().mockResolvedValue(oneUser),
    delete: jest.fn().mockResolvedValue(oneUser),
  },
  userProvider: {
    findFirst: jest.fn().mockResolvedValue(oneUser),
  },
};
const mockPasswordService = {
  validatePassword: jest.fn(),
  hashPassword: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: db,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  const updatedData: UpdateUserInput = { id: 'invalid-id', firstName: 'Updated' };
  const prismaNotFoundError = new Prisma.PrismaClientKnownRequestError('No User found', {
    code: 'P2025',
    clientVersion: '4.0.0',
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of users', async () => {
      await expect(service.findAll()).resolves.toEqual(userArray);
    });

    it('should return empty array if no users', async () => {
      jest.spyOn(prisma.user, 'findMany').mockResolvedValueOnce([]);
      await expect(service.findAll()).resolves.toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(oneUser);
      await expect(service.findOne(oneUser.id)).resolves.toEqual(oneUser);
    });

    it('should return null if user does not exist', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).resolves.toBe(null);
    });

    it('should throw InternalServerErrorException on DB error', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockRejectedValueOnce(new InternalServerErrorException());
      await expect(service.findOne(oneUser.id)).rejects.toThrow(InternalServerErrorException);
    });
  });
  describe('findOneOrThrow', () => {
    it('should return a single user', async () => {
      jest.spyOn(prisma.user, 'findUniqueOrThrow').mockResolvedValueOnce(oneUser);
      await expect(service.findOneOrThrow(oneUser.id)).resolves.toEqual(oneUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(prisma.user, 'findUniqueOrThrow').mockRejectedValueOnce(prismaNotFoundError);
      await expect(service.findOneOrThrow('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on DB error', async () => {
      jest.spyOn(prisma.user, 'findUniqueOrThrow').mockRejectedValueOnce(new Error('DB error'));
      await expect(service.findOneOrThrow(oneUser.id)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOneByEmail', () => {
    const randomEmail = 'randomemail@email.com';
    it('should return a single user', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValueOnce(oneUser);
      await expect(service.findOneByEmail(oneUser.email)).resolves.toEqual(oneUser);
    });

    it('should return null if user does not exist', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
      await expect(service.findOneByEmail(randomEmail)).resolves.toBe(null);
    });

    it('should throw InternalServerErrorException on DB error', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockRejectedValueOnce(new InternalServerErrorException());
      await expect(service.findOneByEmail(randomEmail)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOneByEmailOrThrow', () => {
    const randomEmail = 'randomemail@email.com';
    it('should return a single user', async () => {
      jest.spyOn(prisma.user, 'findFirstOrThrow').mockResolvedValueOnce(oneUser);
      await expect(service.findOneByEmailOrThrow(oneUser.email)).resolves.toEqual(oneUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(prisma.user, 'findFirstOrThrow').mockRejectedValue(prismaNotFoundError);
      await expect(service.findOneByEmailOrThrow(randomEmail)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on DB error', async () => {
      jest.spyOn(prisma.user, 'findFirstOrThrow').mockRejectedValueOnce(new Error('DB error'));
      await expect(service.findOneByEmailOrThrow(randomEmail)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getProvidedUser', () => {
    const provider = userProviderArray[0];
    it('should return the user without passwordHash when found', async () => {
      (prisma.userProvider.findFirst as jest.Mock).mockResolvedValue({ user: oneUser });

      const result = await service.getProvidedUser(provider.provider, provider.providerId);
      expect(result).toEqual(oneUser);
      expect(prisma.userProvider.findFirst).toHaveBeenCalledWith({
        where: { providerId: provider.providerId, provider: provider.provider },
        select: { user: { omit: { passwordHash: true } } },
      });
    });

    it('should return null when no userProvider record is found', async () => {
      (prisma.userProvider.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.getProvidedUser(provider.provider, provider.providerId);
      expect(result).toBeNull();
      expect(prisma.userProvider.findFirst).toHaveBeenCalled();
    });

    it('should handle Prisma errors gracefully', async () => {
      (prisma.userProvider.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(service.getProvidedUser(provider.provider, provider.providerId)).rejects.toThrow('DB error');
    });
  });

  describe('updateOne', () => {
    it('should successfully update a user', async () => {
      // const updatedData: UpdateUserInput = { id: 1, firstName: 'Updated' };
      await expect(service.update(updatedData)).resolves.toEqual(oneUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(prisma.user, 'update').mockRejectedValueOnce(prismaNotFoundError);
      await expect(service.update({ id: 'invalid-id', firstName: 'Updated' })).rejects.toThrow(NotFoundException);
    });

    it('should throw error on invalid update data', async () => {
      jest.spyOn(prisma.user, 'update').mockRejectedValueOnce(new Error('DB error'));
      await expect(service.update({ id: oneUser.id, email: null! })).rejects.toThrow();
    });
  });

  describe('deleteOne', () => {
    it('should successfully delete a user', async () => {
      await expect(service.remove(oneUser.id)).resolves.toEqual(oneUser);
    });

    it('should throw NotFoundException is user does not exist', async () => {
      jest.spyOn(prisma.user, 'delete').mockRejectedValueOnce(prismaNotFoundError);
      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException', async () => {
      jest.spyOn(prisma.user, 'delete').mockRejectedValueOnce(new Error('DB error'));
      await expect(service.remove('invalid-id')).rejects.toThrow();
    });
  });
});
