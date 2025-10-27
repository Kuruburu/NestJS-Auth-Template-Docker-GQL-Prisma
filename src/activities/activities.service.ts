import { Injectable } from '@nestjs/common';
import { CreateActivityInput } from './dto/create-activity.input';
import { UpdateActivityInput } from './dto/update-activity.input';
import { PrismaService } from 'nestjs-prisma';
import { Activity } from '@prisma/client';
import {
  CatchBaseCreateError,
  CatchBaseFindOrThrowError,
  CatchBaseUpdateError,
  CatchBaseRemoveError,
} from 'src/common/helpers/baseErrorHelper';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createActivityInput: CreateActivityInput): Promise<Activity> {
    const { fieldId, sportId } = createActivityInput;
    try {
      return await this.prisma.activity.create({ data: createActivityInput });
    } catch (error) {
      return CatchBaseCreateError(error, 'Activity', {
        foreignKey: { fieldId, sportId },
      });
    }
  }

  async findAll(): Promise<Activity[]> {
    return await this.prisma.activity.findMany();
  }

  async findOne(id: string): Promise<Activity | null> {
    return await this.prisma.activity.findUnique({ where: { id } });
  }

  async findOneOrThrow(id: string): Promise<Activity> {
    try {
      return await this.prisma.activity.findUniqueOrThrow({ where: { id } });
    } catch (error) {
      return CatchBaseFindOrThrowError(error, 'Activity', id);
    }
  }

  async update(updateActivityInput: UpdateActivityInput): Promise<Activity> {
    const { id, ...data } = updateActivityInput;
    try {
      return await this.prisma.activity.update({ where: { id }, data });
    } catch (error) {
      return CatchBaseUpdateError(error, 'Activity', id);
    }
  }

  async remove(id: string): Promise<Activity> {
    try {
      return await this.prisma.activity.delete({ where: { id } });
    } catch (error) {
      return CatchBaseRemoveError(error, 'Activity', id);
    }
  }
}
