import { Test, TestingModule } from '@nestjs/testing';
import { PlacesResolver } from './places.resolver';
import { PlacesService } from './places.service';
import { Place } from '@prisma/client';
import { CreatePlaceInput } from './dto/create-place.input';
import { UpdatePlaceInput } from './dto/update-place.input';

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

const input: CreatePlaceInput = {
  name: 'new-place',
  ownerId: 'new-place-owner-1',
  city: 'new-city',
  address: 'new-address',
  latitude: 69,
  longitude: 69,
  businessId: 'new-business-id',
  description: 'new-description',
};

const updateInput: UpdatePlaceInput = { id: 'place-1', name: 'Updated place' };

describe('PlacesResolver', () => {
  let resolver: PlacesResolver;
  let service: PlacesService;

  const mockPlacesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findOneOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlacesResolver, { provide: PlacesService, useValue: mockPlacesService }],
    }).compile();

    resolver = module.get<PlacesResolver>(PlacesResolver);
    service = module.get<PlacesService>(PlacesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createPlace', () => {
    it('should call service.create and return the result', async () => {
      mockPlacesService.create.mockResolvedValue(mockPlace);

      const result = await resolver.createPlace(input);

      expect(service.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockPlace);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return the result', async () => {
      mockPlacesService.findAll.mockResolvedValue([mockPlace]);

      const result = await resolver.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockPlace]);
    });
  });

  describe('findOne', () => {
    it('should call service.findOneOrThrow with id and return the result', async () => {
      mockPlacesService.findOneOrThrow.mockResolvedValue(mockPlace);

      const result = await resolver.findOne('place-1');

      expect(service.findOneOrThrow).toHaveBeenCalledWith('place-1');
      expect(result).toEqual(mockPlace);
    });
  });

  describe('updatePlace', () => {
    it('should call service.update with update input and return the result', async () => {
      mockPlacesService.update.mockResolvedValue({ ...mockPlace, name: updateInput.name });

      const result = await resolver.updatePlace(updateInput);

      expect(service.update).toHaveBeenCalledWith(updateInput);
      expect(result).toEqual({ ...mockPlace, name: updateInput.name });
    });
  });

  describe('removePlace', () => {
    it('should call service.remove with id and return the result', async () => {
      mockPlacesService.remove.mockResolvedValue(mockPlace);

      const result = await resolver.removePlace('place-1');

      expect(service.remove).toHaveBeenCalledWith('place-1');
      expect(result).toEqual(mockPlace);
    });
  });
});
