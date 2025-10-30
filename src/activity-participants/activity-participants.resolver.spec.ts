import { Test, TestingModule } from '@nestjs/testing';
import { ActivityParticipantsResolver } from './activity-participants.resolver';
import { ActivityParticipantsService } from './activity-participants.service';
import { UsersService } from 'src/users/users.service';
import { ActivitiesService } from 'src/activities/activities.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { ActivityParticipant } from './entities/activity-participant.entity';
import { UserDto } from 'src/users/dto/user.dto';
import { Activity } from 'src/activities/entities/activity.entity';
import { CreateActivityParticipantInput } from './dto/create-activity-participant.input';
import { UpdateActivityParticipantInput } from './dto/update-activity-participant.input';
import { FindManyActivityParticipantInput } from './dto/find-many-activity-participant.input';

describe('ActivityParticipantsResolver', () => {
  let resolver: ActivityParticipantsResolver;
  let activityParticipantsService: DeepMockProxy<ActivityParticipantsService>;
  let usersService: DeepMockProxy<UsersService>;
  let activitiesService: DeepMockProxy<ActivitiesService>;

  const mockParticipant: ActivityParticipant = {
    id: 'participant-1',
    activityId: 'activity-1',
    userId: 'user-1',
    joinedAt: new Date('2024-05-20T00:00:00Z'),
    createdAt: new Date('2024-05-20T00:00:00Z'),
    updatedAt: new Date('2024-05-20T00:00:00Z'),
  };

  const mockUser: UserDto = {
    id: 'user-1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'USER',
    passwordHash: 'ssecure-password',
    createdAt: new Date('2024-05-20T00:00:00Z'),
    updatedAt: new Date('2024-05-20T00:00:00Z'),
  };

  const mockActivity: Activity = {
    id: 'activity-1',
    fieldId: 'field-1',
    sportId: 'sport-1',
    startTime: new Date('2024-05-20T10:00:00Z'),
    endTime: new Date('2024-05-20T11:00:00Z'),
    paymentRequired: true,
    price: 100,
    minPlayers: 1,
    maxPlayers: 5,
    createdAt: new Date('2024-05-20T00:00:00Z'),
    updatedAt: new Date('2024-05-20T00:00:00Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityParticipantsResolver,
        { provide: ActivityParticipantsService, useValue: mockDeep<ActivityParticipantsService>() },
        { provide: UsersService, useValue: mockDeep<UsersService>() },
        { provide: ActivitiesService, useValue: mockDeep<ActivitiesService>() },
      ],
    }).compile();

    resolver = module.get<ActivityParticipantsResolver>(ActivityParticipantsResolver);
    activityParticipantsService = module.get(ActivityParticipantsService);
    usersService = module.get(UsersService);
    activitiesService = module.get(ActivitiesService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  // 🔹 CREATE
  describe('createActivityParticipant', () => {
    const input: CreateActivityParticipantInput = { activityId: 'activity-1', userId: 'user-1' };

    it('should create a participant', async () => {
      activityParticipantsService.create.mockResolvedValue(mockParticipant);

      const result = await resolver.createActivityParticipant(input);

      expect(activityParticipantsService.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockParticipant);
    });

    it('should create a participant using currentUser id', async () => {
      activityParticipantsService.create.mockResolvedValue(mockParticipant);
      const activityId = 'activity-1';

      const result = await resolver.joinActivity(activityId, mockUser);

      expect(activityParticipantsService.create).toHaveBeenCalledWith({ activityId, userId: mockUser.id });
      expect(result).toEqual(mockParticipant);
    });
  });

  // 🔹 FIND ALL
  describe('findAll', () => {
    it('should return all participants', async () => {
      activityParticipantsService.findAll.mockResolvedValue([mockParticipant]);

      const result = await resolver.findAll();

      expect(activityParticipantsService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockParticipant]);
    });
  });

  // 🔹 FIND MANY
  describe('findMany', () => {
    const input: FindManyActivityParticipantInput = { activityId: 'activity-1', userId: 'user-1' };

    it('should find participants by activityId or userId', async () => {
      activityParticipantsService.findMany.mockResolvedValue([mockParticipant]);

      const result = await resolver.findMany(input);

      expect(activityParticipantsService.findMany).toHaveBeenCalledWith(input);
      expect(result).toEqual([mockParticipant]);
    });
  });

  // 🔹 FIND ONE
  describe('findOne', () => {
    it('should return a participant by id', async () => {
      activityParticipantsService.findOneOrThrow.mockResolvedValue(mockParticipant);

      const result = await resolver.findOne(mockParticipant.id);

      expect(activityParticipantsService.findOneOrThrow).toHaveBeenCalledWith(mockParticipant.id);
      expect(result).toEqual(mockParticipant);
    });
  });

  // 🔹 UPDATE
  describe('updateActivityParticipant', () => {
    const input: UpdateActivityParticipantInput = { id: 'participant-1', userId: 'user-2' };
    const updatedParticipant = { ...mockParticipant, userId: 'user-2' };

    it('should update a participant', async () => {
      activityParticipantsService.update.mockResolvedValue(updatedParticipant);

      const result = await resolver.updateActivityParticipant(input);

      expect(activityParticipantsService.update).toHaveBeenCalledWith(input);
      expect(result).toEqual(updatedParticipant);
    });
  });

  // 🔹 REMOVE
  describe('removeActivityParticipant', () => {
    it('should remove a participant', async () => {
      activityParticipantsService.remove.mockResolvedValue(mockParticipant);

      const result = await resolver.removeActivityParticipant(mockParticipant.id);

      expect(activityParticipantsService.remove).toHaveBeenCalledWith(mockParticipant.id);
      expect(result).toEqual(mockParticipant);
    });
  });

  // 🔹 RESOLVE FIELD: USER
  describe('user resolve field', () => {
    it('should return the user', async () => {
      usersService.findOne.mockResolvedValue(mockUser);

      const result = await resolver.user(mockParticipant);

      expect(usersService.findOne).toHaveBeenCalledWith(mockParticipant.userId);
      expect(result).toEqual(mockUser);
    });
  });

  // 🔹 RESOLVE FIELD: ACTIVITY
  describe('activity resolve field', () => {
    it('should return the activity', async () => {
      activitiesService.findOne.mockResolvedValue(mockActivity);

      const result = await resolver.activity(mockParticipant);

      expect(activitiesService.findOne).toHaveBeenCalledWith(mockParticipant.activityId);
      expect(result).toEqual(mockActivity);
    });
  });
});
