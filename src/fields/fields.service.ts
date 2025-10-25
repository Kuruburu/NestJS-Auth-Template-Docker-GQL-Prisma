import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateFieldInput } from './dto/create-field.input';
import { UpdateFieldInput } from './dto/update-field.input';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import {
  CatchBaseCreateError,
  CatchBaseFindOrThrowError,
  CatchBaseRemoveError,
} from 'src/common/helpers/baseErrorHelper';
import { FieldWithSports } from './interfaces/fieldWithSports';
import { includeSports } from 'src/common/helpers/prismaHelper';
import { mapFieldWithSports } from 'src/common/helpers/mapFieldWithSports';

@Injectable()
export class FieldsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFieldInput: CreateFieldInput): Promise<FieldWithSports> {
    const { sportsIds, ...data } = createFieldInput;
    try {
      const field = await this.prisma.field.create({
        data: {
          ...data,
          sports: sportsIds
            ? { create: sportsIds.map((sportId) => ({ sport: { connect: { id: sportId } } })) }
            : undefined,
        },
        include: includeSports,
        // include: { sports: { include: { sport: true } } },
      });
      return mapFieldWithSports(field);
    } catch (error) {
      return CatchBaseCreateError(error, 'Field', {
        foreignKey: {
          placeId: data.placeId,
          sportsIds: sportsIds,
        },
      });
    }
  }

  async findAll(): Promise<FieldWithSports[]> {
    const fields = await this.prisma.field.findMany({ include: includeSports });
    return fields.map((field) => mapFieldWithSports(field));
  }

  async findOne(id: string): Promise<FieldWithSports | null> {
    const field = await this.prisma.field.findUnique({
      where: { id },
      include: includeSports,
    });
    if (!field) return null;
    return mapFieldWithSports(field);
  }

  async findOneOrThrow(id: string): Promise<FieldWithSports> {
    try {
      const field = await this.prisma.field.findUniqueOrThrow({
        where: { id },
        include: includeSports,
      });
      return mapFieldWithSports(field);
    } catch (error) {
      return CatchBaseFindOrThrowError(error, 'Field', id);
    }
  }

  async update(updateFieldInput: UpdateFieldInput): Promise<FieldWithSports> {
    const { id, sportsIds, ...data } = updateFieldInput;
    try {
      const field = await this.prisma.field.update({
        where: { id },
        data: {
          ...data,
          sports: sportsIds
            ? { create: sportsIds.map((sportId) => ({ sport: { connect: { id: sportId } } })) }
            : undefined,
        },
        include: includeSports,
      });
      return mapFieldWithSports(field);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025': // record not found
            throw new NotFoundException(`Field with ID ${id} not found`);
          case 'P2003':
            throw new BadRequestException(`Invalid foreign key: at least one of the sportIds are wrong`);
          default:
            throw new BadRequestException(error.message);
        }
      }
      throw new InternalServerErrorException(`Failed to update Field with ID: ${id}`, {
        cause: error,
      });
    }
  }

  async remove(id: string): Promise<FieldWithSports> {
    try {
      const field = await this.prisma.field.delete({ where: { id }, include: includeSports });
      return mapFieldWithSports(field);
    } catch (error) {
      return CatchBaseRemoveError(error, 'Field', id);
    }
  }
}
