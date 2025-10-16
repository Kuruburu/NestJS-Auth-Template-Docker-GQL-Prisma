import { CreateSportInput } from './dto/create-sport.input';
import { UpdateSportInput } from './dto/update-sport.input';
import { Sport } from './entities/sport.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { SportsResolver } from './sports.resolver';
import { SportsService } from './sports.service';

describe('SportsResolver', () => {
  let resolver: SportsResolver;
  let service: SportsService;

  const mockSport: Sport = {
    id: 'sport-1',
    name: 'Volleyball',
    description: null,
    minPlayers: 0,
    maxPlayers: null,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSportsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findOneOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SportsResolver, { provide: SportsService, useValue: mockSportsService }],
    }).compile();

    resolver = module.get<SportsResolver>(SportsResolver);
    service = module.get<SportsService>(SportsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createSport', () => {
    it('should call service.create and return the result', async () => {
      const input: CreateSportInput = { name: 'Basketball', minPlayers: 5 };
      mockSportsService.create.mockResolvedValue(mockSport);

      const result = await resolver.createSport(input);

      expect(service.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockSport);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return the result', async () => {
      mockSportsService.findAll.mockResolvedValue([mockSport]);

      const result = await resolver.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockSport]);
    });
  });

  describe('findOne', () => {
    it('should call service.findOneOrThrow with id and return the result', async () => {
      mockSportsService.findOneOrThrow.mockResolvedValue(mockSport);

      const result = await resolver.findOne('sport-1');

      expect(service.findOneOrThrow).toHaveBeenCalledWith('sport-1');
      expect(result).toEqual(mockSport);
    });
  });

  describe('updateSport', () => {
    it('should call service.update with update input and return the result', async () => {
      const input: UpdateSportInput = { id: 'sport-1', name: 'Updated Volleyball' };
      mockSportsService.update.mockResolvedValue({ ...mockSport, name: input.name });

      const result = await resolver.updateSport(input);

      expect(service.update).toHaveBeenCalledWith(input);
      expect(result).toEqual({ ...mockSport, name: input.name });
    });
  });

  describe('removeSport', () => {
    it('should call service.remove with id and return the result', async () => {
      mockSportsService.remove.mockResolvedValue(mockSport);

      const result = await resolver.removeSport('sport-1');

      expect(service.remove).toHaveBeenCalledWith('sport-1');
      expect(result).toEqual(mockSport);
    });
  });
});
