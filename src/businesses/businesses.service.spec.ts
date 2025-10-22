import { Test, TestingModule } from '@nestjs/testing';
import { BusinessesService } from './businesses.service';
import { PrismaService } from 'nestjs-prisma';
import {
  CatchBaseCreateError,
  CatchBaseFindOrThrowError,
  CatchBaseRemoveError,
  CatchBaseUpdateError,
} from 'src/common/helpers/baseErrorHelper';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Business, PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateBusinessInput } from './dto/update-business.input';

jest.mock('src/common/helpers/baseErrorHelper', () => ({
  CatchBaseUpdateError: jest.fn(),
  CatchBaseRemoveError: jest.fn(),
  CatchBaseFindOrThrowError: jest.fn(),
  CatchBaseCreateError: jest.fn(),
}));

describe('BusinessesService', () => {
  let service: BusinessesService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessesService, { provide: PrismaService, useValue: mockDeep<PrismaClient>() }],
    }).compile();

    service = module.get<BusinessesService>(BusinessesService);
    prisma = module.get(PrismaService);
  });

  const mockBusiness: Business = {
    id: 'business-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'test-business',
    email: 'test-business@example.com',
    phone: '123123123',
    ownerId: 'owner-1',
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const input = {
      email: 'new-business@example.com',
      name: 'new-business',
      ownerId: 'new-owner-1',
      phone: '234234234',
    };
    it('should create a business successfully', async () => {
      const createdBusiness: Business = {
        ...input,
        id: 'new-business',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.business.create.mockResolvedValue(createdBusiness);

      const result = await service.create(input);

      expect(prisma.business.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual(createdBusiness);
    });

    it('should call CatchBaseCreateError on create error', async () => {
      const error = new Error('Create failed');
      prisma.business.create.mockRejectedValue(error);

      await service.create(input);

      expect(CatchBaseCreateError).toHaveBeenCalledWith(error, 'Business', {
        foreignKey: { ownerId: 'new-owner-1' },
      });
    });
  });

  describe('findAll', () => {
    it('should return all businesss', async () => {
      const businesses: Business[] = [mockBusiness];
      prisma.business.findMany.mockResolvedValue(businesses);

      const result = await service.findAll();

      expect(prisma.business.findMany).toHaveBeenCalled();
      expect(result).toEqual(businesses);
    });
  });

  describe('findOne', () => {
    it('should return one business', async () => {
      prisma.business.findUnique.mockResolvedValue(mockBusiness);

      const result = await service.findOne(mockBusiness.id);

      expect(prisma.business.findUnique).toHaveBeenCalledWith({ where: { id: mockBusiness.id } });
      expect(result).toEqual(mockBusiness);
    });

    it('should return null if not found', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      const result = await service.findOne('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('findOneOrThrow', () => {
    it('should return business if found', async () => {
      prisma.business.findUniqueOrThrow.mockResolvedValue(mockBusiness);

      const result = await service.findOneOrThrow(mockBusiness.id);
      expect(result).toEqual(mockBusiness);
    });

    it('should call CatchBaseFindUniqueOrThrowError on failure', async () => {
      const error = new PrismaClientKnownRequestError('error', { code: 'P2025', clientVersion: '6.9' });
      prisma.business.findUniqueOrThrow.mockRejectedValue(error);

      await service.findOneOrThrow(mockBusiness.id);

      expect(CatchBaseFindOrThrowError).toHaveBeenCalledWith(error, 'Business', mockBusiness.id);
    });
  });

  describe('update', () => {
    const updateBusinessInput: UpdateBusinessInput = { id: mockBusiness.id, name: 'updated business' };
    it('should update a business successfully', async () => {
      const updatedBusiness: Business = { ...mockBusiness, name: updateBusinessInput.name as string };
      prisma.business.update.mockResolvedValue(updatedBusiness);

      const result = await service.update(updateBusinessInput);

      expect(prisma.business.update).toHaveBeenCalledWith({
        where: { id: updateBusinessInput.id },
        data: { name: updateBusinessInput.name },
      });
      expect(result).toEqual(updatedBusiness);
    });

    it('should call CatchBaseUpdateError on update failure', async () => {
      const error = new Error('Update failed');
      prisma.business.update.mockRejectedValue(error);

      await service.update(updateBusinessInput);

      expect(CatchBaseUpdateError).toHaveBeenCalledWith(error, 'Business', updateBusinessInput.id);
    });
  });

  describe('remove', () => {
    it('should delete a business successfully', async () => {
      prisma.business.delete.mockResolvedValue(mockBusiness);

      const result = await service.remove(mockBusiness.id);

      expect(prisma.business.delete).toHaveBeenCalledWith({ where: { id: mockBusiness.id } });
      expect(result).toEqual(mockBusiness);
    });

    it('should call CatchBaseRemoveError on delete failure', async () => {
      const error = new Error('Delete failed');
      prisma.business.delete.mockRejectedValue(error);

      await service.remove('b1');

      expect(CatchBaseRemoveError).toHaveBeenCalledWith(error, 'Business', 'b1');
    });
  });
});
