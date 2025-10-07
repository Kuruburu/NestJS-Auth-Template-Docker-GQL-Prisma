import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { UpdateUserInput } from './dto/update-user.input';
import { NotFoundException } from '@nestjs/common';
import { faker } from '@faker-js/faker/.';
import { User } from '@prisma/client';
//
describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let service: UsersService;

  const mockUsers: User[] = [
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

  const mockUserService = {
    findAll: jest.fn().mockImplementation(() => Promise.resolve(mockUsers)),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    findOne: jest.fn().mockImplementation((_id: number) => Promise.resolve(mockUsers[0])),
    update: jest.fn().mockImplementation((input) => Promise.resolve(input)),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    remove: jest.fn().mockImplementation((_id: number) => Promise.resolve(mockUsers[0])),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersResolver, { provide: UsersService, useValue: mockUserService }],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      mockUserService.findAll.mockResolvedValue(mockUsers);

      const result = await resolver.findAll();

      expect(result).toEqual(mockUsers);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      mockUserService.findOne.mockResolvedValue(mockUsers[0]);

      const result = await resolver.findOne(1);

      expect(result).toEqual(mockUsers[0]);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserService.findOne.mockRejectedValue(new NotFoundException('User with ID 99 not found'));

      await expect(resolver.findOne(99)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(99);
    });
  });

  describe('updateUser', () => {
    it('should throw NotFoundException', async () => {
      const updateInput: UpdateUserInput = { id: 99, firstName: 'Updated User' };
      const notFound = new NotFoundException('User not found');
      mockUserService.update.mockRejectedValue(notFound);

      await expect(resolver.update(updateInput)).rejects.toThrow(notFound);
      expect(service.update).toHaveBeenCalledWith(updateInput);
    });
    it('should update and return a user', async () => {
      const updateInput: UpdateUserInput = { id: 1, firstName: 'Updated User' };
      const updatedUser = { ...mockUsers[0], ...updateInput };
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await resolver.update(updateInput);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(updateInput);
    });
  });

  describe('removeUser', () => {
    it('should remove and return a user', async () => {
      mockUserService.remove.mockResolvedValue(mockUsers[0]);

      const result = await resolver.remove(1);

      expect(result).toEqual(mockUsers[0]);
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserService.remove.mockRejectedValue(new NotFoundException('User with ID 99 not found'));

      await expect(resolver.remove(99)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(99);
    });
  });
});
