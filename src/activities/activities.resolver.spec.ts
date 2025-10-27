import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesResolver } from './activities.resolver';
import { ActivitiesService } from './activities.service';
import { Activity } from '@prisma/client';
import { CreateActivityInput } from './dto/create-activity.input';
import { UpdateActivityInput } from './dto/update-activity.input';

describe('ActivitiesResolver', () => {
  let resolver: ActivitiesResolver;
  let service: ActivitiesService;

  const mockActivity: Activity = {
    id: 'activity-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    fieldId: 'field-1',
    sportId: 'sport-1',
    startTime: new Date(),
    endTime: new Date(),
    paymentRequired: false,
    price: null,
    minPlayers: 0,
    maxPlayers: null,
  };

  const mockActivitiesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findOneOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivitiesResolver, { provide: ActivitiesService, useValue: mockActivitiesService }],
    }).compile();

    resolver = module.get<ActivitiesResolver>(ActivitiesResolver);
    service = module.get<ActivitiesService>(ActivitiesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createSport', () => {
    it('should call service.create and return the result', async () => {
      const input: CreateActivityInput = {
        fieldId: 'field-1',
        sportId: 'sport-1',
        startTime: new Date(),
        endTime: new Date(),
        minPlayers: 1,
      };
      mockActivitiesService.create.mockResolvedValue(mockActivity);

      const result = await resolver.createActivity(input);

      expect(service.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockActivity);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return the result', async () => {
      mockActivitiesService.findAll.mockResolvedValue([mockActivity]);

      const result = await resolver.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockActivity]);
    });
  });

  describe('findOne', () => {
    it('should call service.findOneOrThrow with id and return the result', async () => {
      mockActivitiesService.findOneOrThrow.mockResolvedValue(mockActivity);

      const result = await resolver.findOne('activity-1');

      expect(service.findOneOrThrow).toHaveBeenCalledWith('activity-1');
      expect(result).toEqual(mockActivity);
    });
  });

  describe('updateSport', () => {
    it('should call service.update with update input and return the result', async () => {
      const input: UpdateActivityInput = { id: 'activity-1', minPlayers: 5 };
      mockActivitiesService.update.mockResolvedValue({ ...mockActivity, minPlayers: 5 });

      const result = await resolver.updateActivity(input);

      expect(service.update).toHaveBeenCalledWith(input);
      expect(result).toEqual({ ...mockActivity, minPlayers: 5 });
    });
  });

  describe('removeSport', () => {
    it('should call service.remove with id and return the result', async () => {
      mockActivitiesService.remove.mockResolvedValue(mockActivity);

      const result = await resolver.removeActivity('activity-1');

      expect(service.remove).toHaveBeenCalledWith('activity-1');
      expect(result).toEqual(mockActivity);
    });
  });
});
