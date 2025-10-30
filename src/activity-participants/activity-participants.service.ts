import { Injectable } from '@nestjs/common';
import { CreateActivityParticipantInput } from './dto/create-activity-participant.input';
import { UpdateActivityParticipantInput } from './dto/update-activity-participant.input';
import { ActivityParticipant } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import {
  CatchBaseCreateError,
  CatchBaseFindOrThrowError,
  CatchBaseUpdateError,
  CatchBaseRemoveError,
} from 'src/common/helpers/baseErrorHelper';
import { FindManyActivityParticipantInput } from './dto/find-many-activity-participant.input';

@Injectable()
export class ActivityParticipantsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createActivityParticipantInput: CreateActivityParticipantInput): Promise<ActivityParticipant> {
    const { activityId, userId } = createActivityParticipantInput;
    const joinedAt = new Date();
    const data = { ...createActivityParticipantInput, joinedAt };
    try {
      return await this.prisma.activityParticipant.create({ data });
    } catch (error) {
      return CatchBaseCreateError(error, 'ActivityParticipant', {
        foreignKey: { activityId, userId },
      });
    }
  }

  async findAll(): Promise<ActivityParticipant[]> {
    return await this.prisma.activityParticipant.findMany();
  }

  async findOne(id: string): Promise<ActivityParticipant | null> {
    return await this.prisma.activityParticipant.findUnique({ where: { id } });
  }

  async findMany(findManyActivityParticipantInput: FindManyActivityParticipantInput): Promise<ActivityParticipant[]> {
    const { activityId, userId } = findManyActivityParticipantInput;
    return await this.prisma.activityParticipant.findMany({ where: { OR: [{ activityId }, { userId }] } });
  }

  async findOneOrThrow(id: string): Promise<ActivityParticipant> {
    try {
      return await this.prisma.activityParticipant.findUniqueOrThrow({ where: { id } });
    } catch (error) {
      return CatchBaseFindOrThrowError(error, 'ActivityParticipant', id);
    }
  }

  async update(updateActivityParticipantInput: UpdateActivityParticipantInput): Promise<ActivityParticipant> {
    const { id, ...data } = updateActivityParticipantInput;
    try {
      return await this.prisma.activityParticipant.update({ where: { id }, data });
    } catch (error) {
      return CatchBaseUpdateError(error, 'ActivityParticipant', id);
    }
  }

  async remove(id: string): Promise<ActivityParticipant> {
    try {
      return await this.prisma.activityParticipant.delete({ where: { id } });
    } catch (error) {
      return CatchBaseRemoveError(error, 'ActivityParticipant', id);
    }
  }
}
