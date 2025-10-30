import { Test, TestingModule } from '@nestjs/testing';
import { ActivityParticipantsService } from './activity-participants.service';
import { PrismaService } from 'nestjs-prisma';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, ActivityParticipant } from '@prisma/client';
import {
  CatchBaseCreateError,
  CatchBaseFindOrThrowError,
  CatchBaseUpdateError,
  CatchBaseRemoveError,
} from 'src/common/helpers/baseErrorHelper';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateActivityParticipantInput } from './dto/create-activity-participant.input';
import { UpdateActivityParticipantInput } from './dto/update-activity-participant.input';
import { FindManyActivityParticipantInput } from './dto/find-many-activity-participant.input';

// Mock all base error helpers
jest.mock('src/common/helpers/baseErrorHelper', () => ({
  CatchBaseCreateError: jest.fn(),
  CatchBaseFindOrThrowError: jest.fn(),
  CatchBaseUpdateError: jest.fn(),
  CatchBaseRemoveError: jest.fn(),
}));

describe('ActivityParticipantsService', () => {
  let service: ActivityParticipantsService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityParticipantsService, { provide: PrismaService, useValue: mockDeep<PrismaClient>() }],
    }).compile();

    service = module.get<ActivityParticipantsService>(ActivityParticipantsService);
    prisma = module.get(PrismaService);
  });

  const mockParticipant: ActivityParticipant = {
    id: 'participant-1',
    activityId: 'activity-1',
    userId: 'user-1',
    joinedAt: new Date('2024-05-20T00:00:00Z'),
    createdAt: new Date('2024-05-20T00:00:00Z'),
    updatedAt: new Date('2024-05-20T00:00:00Z'),
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 🧪 CREATE
  describe('create', () => {
    const input: CreateActivityParticipantInput = {
      activityId: 'activity-1',
      userId: 'user-2',
    };

    it('should create an activity participant successfully', async () => {
      const createdParticipant = { ...mockParticipant, ...input };
      prisma.activityParticipant.create.mockResolvedValue(createdParticipant);

      const result = await service.create(input);

      expect(prisma.activityParticipant.create).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          activityId: input.activityId,
          userId: input.userId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          joinedAt: expect.any(Date),
        }),
      });
      expect(result).toEqual(createdParticipant);
    });

    it('should call CatchBaseCreateError on create failure', async () => {
      const error = new Error('Create failed');
      prisma.activityParticipant.create.mockRejectedValue(error);

      await service.create(input);

      expect(CatchBaseCreateError).toHaveBeenCalledWith(error, 'ActivityParticipant', {
        foreignKey: { activityId: input.activityId, userId: input.userId },
      });
    });
  });

  // 🧪 FIND ALL
  describe('findAll', () => {
    it('should return all activity participants', async () => {
      const participants = [mockParticipant];
      prisma.activityParticipant.findMany.mockResolvedValue(participants);

      const result = await service.findAll();

      expect(prisma.activityParticipant.findMany).toHaveBeenCalled();
      expect(result).toEqual(participants);
    });
  });

  // 🧪 FIND ONE
  describe('findOne', () => {
    it('should return a participant by ID', async () => {
      prisma.activityParticipant.findUnique.mockResolvedValue(mockParticipant);

      const result = await service.findOne(mockParticipant.id);

      expect(prisma.activityParticipant.findUnique).toHaveBeenCalledWith({
        where: { id: mockParticipant.id },
      });
      expect(result).toEqual(mockParticipant);
    });

    it('should return null if participant not found', async () => {
      prisma.activityParticipant.findUnique.mockResolvedValue(null);

      const result = await service.findOne('nonexistent-id');
      expect(result).toBeNull();
    });
  });

  // 🧪 FIND MANY
  describe('findMany', () => {
    const input: FindManyActivityParticipantInput = {
      activityId: 'activity-1',
      userId: 'user-1',
    };

    it('should find participants by activityId or userId', async () => {
      const participants = [mockParticipant];
      prisma.activityParticipant.findMany.mockResolvedValue(participants);

      const result = await service.findMany(input);

      expect(prisma.activityParticipant.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ activityId: input.activityId }, { userId: input.userId }],
        },
      });
      expect(result).toEqual(participants);
    });
  });

  // 🧪 FIND ONE OR THROW
  describe('findOneOrThrow', () => {
    it('should return participant if found', async () => {
      prisma.activityParticipant.findUniqueOrThrow.mockResolvedValue(mockParticipant);

      const result = await service.findOneOrThrow(mockParticipant.id);

      expect(result).toEqual(mockParticipant);
    });

    it('should call CatchBaseFindOrThrowError on failure', async () => {
      const error = new PrismaClientKnownRequestError('error', {
        code: 'P2025',
        clientVersion: '6.9',
      });
      prisma.activityParticipant.findUniqueOrThrow.mockRejectedValue(error);

      await service.findOneOrThrow(mockParticipant.id);

      expect(CatchBaseFindOrThrowError).toHaveBeenCalledWith(error, 'ActivityParticipant', mockParticipant.id);
    });
  });

  // 🧪 UPDATE
  describe('update', () => {
    const input: UpdateActivityParticipantInput = {
      id: 'participant-1',
      userId: 'user-3',
    };

    it('should update a participant successfully', async () => {
      const updated = { ...mockParticipant, userId: input.userId as string };
      prisma.activityParticipant.update.mockResolvedValue(updated);

      const result = await service.update(input);

      expect(prisma.activityParticipant.update).toHaveBeenCalledWith({
        where: { id: input.id },
        data: { userId: input.userId },
      });
      expect(result).toEqual(updated);
    });

    it('should call CatchBaseUpdateError on update failure', async () => {
      const error = new Error('Update failed');
      prisma.activityParticipant.update.mockRejectedValue(error);

      await service.update(input);

      expect(CatchBaseUpdateError).toHaveBeenCalledWith(error, 'ActivityParticipant', input.id);
    });
  });

  // 🧪 REMOVE
  describe('remove', () => {
    it('should delete a participant successfully', async () => {
      prisma.activityParticipant.delete.mockResolvedValue(mockParticipant);

      const result = await service.remove(mockParticipant.id);

      expect(prisma.activityParticipant.delete).toHaveBeenCalledWith({
        where: { id: mockParticipant.id },
      });
      expect(result).toEqual(mockParticipant);
    });

    it('should call CatchBaseRemoveError on delete failure', async () => {
      const error = new Error('Delete failed');
      prisma.activityParticipant.delete.mockRejectedValue(error);

      await service.remove('participant-123');

      expect(CatchBaseRemoveError).toHaveBeenCalledWith(error, 'ActivityParticipant', 'participant-123');
    });
  });
});
