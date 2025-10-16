import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateSportInput } from './dto/create-sport.input';
import { UpdateSportInput } from './dto/update-sport.input';
import { PrismaService } from 'nestjs-prisma';
import {
  CatchBaseFindOrThrowError,
  CatchBaseRemoveError,
  CatchBaseUpdateError,
} from 'src/common/helpers/baseErrorHelper';
import { Sport } from '@prisma/client';

@Injectable()
export class SportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSportInput: CreateSportInput): Promise<Sport> {
    try {
      return await this.prisma.sport.create({ data: createSportInput });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to create sport, ${error}`);
    }
  }

  async findAll() {
    return await this.prisma.sport.findMany();
  }

  async findOneOrThrow(id: string): Promise<Sport> {
    try {
      return await this.prisma.sport.findUniqueOrThrow({ where: { id } });
    } catch (error) {
      return CatchBaseFindOrThrowError(error, 'Sport', id);
    }
  }

  async findOne(id: string): Promise<Sport | null> {
    return await this.prisma.sport.findUnique({ where: { id } });
  }

  async update(updateSportInput: UpdateSportInput): Promise<Sport> {
    const { id, ...data } = updateSportInput;
    try {
      return await this.prisma.sport.update({ where: { id }, data });
    } catch (error) {
      return CatchBaseUpdateError(error, 'Sport', id);
    }
  }

  async remove(id: string): Promise<Sport> {
    try {
      return await this.prisma.sport.delete({ where: { id } });
    } catch (error) {
      return CatchBaseRemoveError(error, 'Sport', id);
    }
  }
}
