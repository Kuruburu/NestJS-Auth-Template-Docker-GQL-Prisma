import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateSportInput } from './dto/create-sport.input';
import { UpdateSportInput } from './dto/update-sport.input';
import { PrismaService } from 'nestjs-prisma';
import {
  CatchBaseFindUniqueOrThrowError,
  CatchBaseRemoveError,
  CatchBaseUpdateError,
} from 'src/common/helpers/baseErrorHelper';

@Injectable()
export class SportsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createSportInput: CreateSportInput) {
    try {
      return await this.prisma.sport.create({ data: createSportInput });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to create sport, ${error}`);
    }
  }

  async findAll() {
    return await this.prisma.sport.findMany();
  }

  async findOneOrThrow(id: string) {
    try {
      return await this.prisma.sport.findUniqueOrThrow({ where: { id } });
    } catch (error) {
      CatchBaseFindUniqueOrThrowError(error, 'Sport', id);
    }
  }

  async findOne(id: string) {
    return await this.prisma.sport.findUnique({ where: { id } });
  }

  async update(updateSportInput: UpdateSportInput) {
    const { id, ...data } = updateSportInput;
    try {
      return await this.prisma.sport.update({ where: { id }, data });
    } catch (error) {
      CatchBaseUpdateError(error, 'Sport', id);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.sport.delete({ where: { id } });
    } catch (error) {
      CatchBaseRemoveError(error, 'Sport', id);
    }
  }
}
