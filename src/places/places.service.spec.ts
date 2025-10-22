import { Test, TestingModule } from '@nestjs/testing';
import { PlacesService } from './places.service';
import { PrismaService } from 'nestjs-prisma';
import {
  CatchBaseCreateError,
  CatchBaseFindOrThrowError,
  CatchBaseRemoveError,
  CatchBaseUpdateError,
} from 'src/common/helpers/baseErrorHelper';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Place, PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdatePlaceInput } from './dto/update-place.input';
jest.mock('src/common/helpers/baseErrorHelper', () => ({
  CatchBaseUpdateError: jest.fn(),
  CatchBaseRemoveError: jest.fn(),
  CatchBaseFindOrThrowError: jest.fn(),
  CatchBaseCreateError: jest.fn(),
}));

describe('PlacesService', () => {
  let service: PlacesService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlacesService, { provide: PrismaService, useValue: mockDeep<PrismaClient>() }],
    }).compile();

    service = module.get<PlacesService>(PlacesService);
    prisma = module.get(PrismaService);
  });

  const mockPlace: Place = {
    id: 'place-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'test-place',
    ownerId: 'owner-1',
    description: 'place-1-description',
    city: 'place-1-city',
    address: 'place-1-address',
    latitude: 36.02,
    longitude: 28.37,
    imageUrl: null,
    businessId: 'business-1',
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const input = {
      name: 'new-place',
      ownerId: 'new-place-owner-1',
      city: 'new-city',
      address: 'new-address',
      latitude: 69,
      longitude: 69,
      businessId: 'new-business-id',
      description: 'new-description',
    };
    it('should create a place successfully', async () => {
      const createdPlace: Place = {
        ...input,
        id: 'new-place',
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: null,
      };
      prisma.place.create.mockResolvedValue(createdPlace);

      const result = await service.create(input);

      expect(prisma.place.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual(createdPlace);
    });

    it('should call CatchBaseCreateError on create error', async () => {
      const error = new Error('Create failed');
      prisma.place.create.mockRejectedValue(error);

      await service.create(input);

      expect(CatchBaseCreateError).toHaveBeenCalledWith(error, 'Place', {
        foreignKey: { ownerId: input.ownerId, businessId: input.businessId },
      });
    });
  });

  describe('findAll', () => {
    it('should return all places', async () => {
      const place: Place[] = [mockPlace];
      prisma.place.findMany.mockResolvedValue(place);

      const result = await service.findAll();

      expect(prisma.place.findMany).toHaveBeenCalled();
      expect(result).toEqual(place);
    });
  });

  describe('findOne', () => {
    it('should return one place', async () => {
      prisma.place.findUnique.mockResolvedValue(mockPlace);

      const result = await service.findOne(mockPlace.id);

      expect(prisma.place.findUnique).toHaveBeenCalledWith({ where: { id: mockPlace.id } });
      expect(result).toEqual(mockPlace);
    });

    it('should return null if not found', async () => {
      prisma.place.findUnique.mockResolvedValue(null);

      const result = await service.findOne('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('findOneOrThrow', () => {
    it('should return place if found', async () => {
      prisma.place.findUniqueOrThrow.mockResolvedValue(mockPlace);

      const result = await service.findOneOrThrow(mockPlace.id);
      expect(result).toEqual(mockPlace);
    });

    it('should call CatchBaseFindUniqueOrThrowError on failure', async () => {
      const error = new PrismaClientKnownRequestError('error', { code: 'P2025', clientVersion: '6.9' });
      prisma.place.findUniqueOrThrow.mockRejectedValue(error);

      await service.findOneOrThrow(mockPlace.id);

      expect(CatchBaseFindOrThrowError).toHaveBeenCalledWith(error, 'Place', mockPlace.id);
    });
  });

  describe('update', () => {
    const updatePlaceInput: UpdatePlaceInput = { id: mockPlace.id, name: 'updated place' };
    it('should update a place successfully', async () => {
      const updatedPlace: Place = { ...mockPlace, name: updatePlaceInput.name as string };
      prisma.place.update.mockResolvedValue(updatedPlace);

      const result = await service.update(updatePlaceInput);

      expect(prisma.place.update).toHaveBeenCalledWith({
        where: { id: updatePlaceInput.id },
        data: { name: updatePlaceInput.name },
      });
      expect(result).toEqual(updatedPlace);
    });

    it('should call CatchBaseUpdateError on update failure', async () => {
      const error = new Error('Update failed');
      prisma.place.update.mockRejectedValue(error);

      await service.update(updatePlaceInput);

      expect(CatchBaseUpdateError).toHaveBeenCalledWith(error, 'Place', updatePlaceInput.id);
    });
  });

  describe('remove', () => {
    it('should delete a Place successfully', async () => {
      prisma.place.delete.mockResolvedValue(mockPlace);

      const result = await service.remove(mockPlace.id);

      expect(prisma.place.delete).toHaveBeenCalledWith({ where: { id: mockPlace.id } });
      expect(result).toEqual(mockPlace);
    });

    it('should call CatchBaseRemoveError on delete failure', async () => {
      const error = new Error('Delete failed');
      prisma.place.delete.mockRejectedValue(error);

      await service.remove('b1');

      expect(CatchBaseRemoveError).toHaveBeenCalledWith(error, 'Place', 'b1');
    });
  });
});
