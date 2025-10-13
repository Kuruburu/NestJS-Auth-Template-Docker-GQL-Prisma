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

      const result = await resolver.findOne(mockUsers[0].id);

      expect(result).toEqual(mockUsers[0]);
      expect(service.findOne).toHaveBeenCalledWith(mockUsers[0].id);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserService.findOne.mockRejectedValue(new NotFoundException('User with ID 99 not found'));

      await expect(resolver.findOne('invalid-id')).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith('invalid-id');
    });
  });

  describe('updateUser', () => {
    it('should throw NotFoundException', async () => {
      const updateInput: UpdateUserInput = { id: 'invalid-id', firstName: 'Updated User' };
      const notFound = new NotFoundException('User not found');
      mockUserService.update.mockRejectedValue(notFound);

      await expect(resolver.update(updateInput)).rejects.toThrow(notFound);
      expect(service.update).toHaveBeenCalledWith(updateInput);
    });
    it('should update and return a user', async () => {
      const updateInput: UpdateUserInput = { id: mockUsers[0].id, firstName: 'Updated User' };
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

      const result = await resolver.remove(mockUsers[0].id);

      expect(result).toEqual(mockUsers[0]);
      expect(service.remove).toHaveBeenCalledWith(mockUsers[0].id);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserService.remove.mockRejectedValue(new NotFoundException('User with ID 99 not found'));

      await expect(resolver.remove('invalid-id')).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith('invalid-id');
    });
  });
});
