import { Test, TestingModule } from '@nestjs/testing';
import { BusinessesResolver } from './businesses.resolver';
import { BusinessesService } from './businesses.service';
import { Business } from '@prisma/client';
import { CreateBusinessInput } from './dto/create-business.input';
import { UpdateBusinessInput } from './dto/update-business.input';

describe('BusinessesResolver', () => {
  let resolver: BusinessesResolver;
  let service: BusinessesService;

  const mockBusiness: Business = {
    id: 'business-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'test-business',
    email: 'test-business@example.com',
    phone: '123123123',
    ownerId: 'owner-1',
  };

  const mockBusinessesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findOneOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessesResolver, { provide: BusinessesService, useValue: mockBusinessesService }],
    }).compile();

    resolver = module.get<BusinessesResolver>(BusinessesResolver);
    service = module.get<BusinessesService>(BusinessesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createSport', () => {
    it('should call service.create and return the result', async () => {
      const input: CreateBusinessInput = {
        email: 'new-business@example.com',
        name: 'new-business',
        ownerId: 'new-owner-1',
        phone: '234234234',
      };
      mockBusinessesService.create.mockResolvedValue(mockBusiness);

      const result = await resolver.createBusiness(input);

      expect(service.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockBusiness);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return the result', async () => {
      mockBusinessesService.findAll.mockResolvedValue([mockBusiness]);

      const result = await resolver.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockBusiness]);
    });
  });

  describe('findOne', () => {
    it('should call service.findOneOrThrow with id and return the result', async () => {
      mockBusinessesService.findOneOrThrow.mockResolvedValue(mockBusiness);

      const result = await resolver.findOne('business-1');

      expect(service.findOneOrThrow).toHaveBeenCalledWith('business-1');
      expect(result).toEqual(mockBusiness);
    });
  });

  describe('updateSport', () => {
    it('should call service.update with update input and return the result', async () => {
      const input: UpdateBusinessInput = { id: 'business-1', name: 'Updated business' };
      mockBusinessesService.update.mockResolvedValue({ ...mockBusiness, name: input.name });

      const result = await resolver.updateBusiness(input);

      expect(service.update).toHaveBeenCalledWith(input);
      expect(result).toEqual({ ...mockBusiness, name: input.name });
    });
  });

  describe('removeSport', () => {
    it('should call service.remove with id and return the result', async () => {
      mockBusinessesService.remove.mockResolvedValue(mockBusiness);

      const result = await resolver.removeBusiness('business-1');

      expect(service.remove).toHaveBeenCalledWith('business-1');
      expect(result).toEqual(mockBusiness);
    });
  });
});
