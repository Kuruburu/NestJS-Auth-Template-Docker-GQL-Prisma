import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesService } from './activities.service';
import { PrismaService } from 'nestjs-prisma';
import {
  CatchBaseCreateError,
  CatchBaseFindOrThrowError,
  CatchBaseRemoveError,
  CatchBaseUpdateError,
} from 'src/common/helpers/baseErrorHelper';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Activity, PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateActivityInput } from './dto/update-activity.input';

jest.mock('src/common/helpers/baseErrorHelper', () => ({
  CatchBaseUpdateError: jest.fn(),
  CatchBaseRemoveError: jest.fn(),
  CatchBaseFindOrThrowError: jest.fn(),
  CatchBaseCreateError: jest.fn(),
}));

describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivitiesService, { provide: PrismaService, useValue: mockDeep<PrismaClient>() }],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
    prisma = module.get(PrismaService);
  });

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const input = {
      fieldId: 'field-1',
      sportId: 'sport-1',
      startTime: new Date(),
      endTime: new Date(),
      minPlayers: 1,
    };
    it('should create a activity successfully', async () => {
      prisma.activity.create.mockResolvedValue(mockActivity);

      const result = await service.create(input);

      expect(prisma.activity.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual(mockActivity);
    });

    it('should call CatchBaseCreateError on create error', async () => {
      const error = new Error('Create failed');
      prisma.activity.create.mockRejectedValue(error);

      await service.create(input);

      expect(CatchBaseCreateError).toHaveBeenCalledWith(error, 'Activity', {
        foreignKey: { fieldId: input.fieldId, sportId: input.sportId },
      });
    });
  });

  describe('findAll', () => {
    it('should return all activity', async () => {
      const activities: Activity[] = [mockActivity];
      prisma.activity.findMany.mockResolvedValue(activities);

      const result = await service.findAll();

      expect(prisma.activity.findMany).toHaveBeenCalled();
      expect(result).toEqual(activities);
    });
  });

  describe('findOne', () => {
    it('should return one activities', async () => {
      prisma.activity.findUnique.mockResolvedValue(mockActivity);

      const result = await service.findOne(mockActivity.id);

      expect(prisma.activity.findUnique).toHaveBeenCalledWith({ where: { id: mockActivity.id } });
      expect(result).toEqual(mockActivity);
    });

    it('should return null if not found', async () => {
      prisma.activity.findUnique.mockResolvedValue(null);

      const result = await service.findOne('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('findOneOrThrow', () => {
    it('should return activity if found', async () => {
      prisma.activity.findUniqueOrThrow.mockResolvedValue(mockActivity);

      const result = await service.findOneOrThrow(mockActivity.id);
      expect(result).toEqual(mockActivity);
    });

    it('should call CatchBaseFindUniqueOrThrowError on failure', async () => {
      const error = new PrismaClientKnownRequestError('error', { code: 'P2025', clientVersion: '6.9' });
      prisma.activity.findUniqueOrThrow.mockRejectedValue(error);

      await service.findOneOrThrow(mockActivity.id);

      expect(CatchBaseFindOrThrowError).toHaveBeenCalledWith(error, 'Activity', mockActivity.id);
    });
  });

  describe('update', () => {
    const updateActivityInput: UpdateActivityInput = { id: mockActivity.id, minPlayers: 5 };
    it('should update a business successfully', async () => {
      const updatedActivity: Activity = { ...mockActivity, minPlayers: 5 };
      prisma.activity.update.mockResolvedValue(updatedActivity);

      const result = await service.update(updateActivityInput);

      expect(prisma.activity.update).toHaveBeenCalledWith({
        where: { id: updateActivityInput.id },
        data: { minPlayers: 5 },
      });
      expect(result).toEqual(updatedActivity);
    });

    it('should call CatchBaseUpdateError on update failure', async () => {
      const error = new Error('Update failed');
      prisma.activity.update.mockRejectedValue(error);

      await service.update(updateActivityInput);

      expect(CatchBaseUpdateError).toHaveBeenCalledWith(error, 'Activity', updateActivityInput.id);
    });
  });

  describe('remove', () => {
    it('should delete a business successfully', async () => {
      prisma.activity.delete.mockResolvedValue(mockActivity);

      const result = await service.remove(mockActivity.id);

      expect(prisma.activity.delete).toHaveBeenCalledWith({ where: { id: mockActivity.id } });
      expect(result).toEqual(mockActivity);
    });

    it('should call CatchBaseRemoveError on delete failure', async () => {
      const error = new Error('Delete failed');
      prisma.activity.delete.mockRejectedValue(error);

      await service.remove('a1');

      expect(CatchBaseRemoveError).toHaveBeenCalledWith(error, 'Activity', 'a1');
    });
  });
});
