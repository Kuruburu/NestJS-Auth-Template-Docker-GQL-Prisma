import { Injectable } from '@nestjs/common';
import { CreatePlaceInput } from './dto/create-place.input';
import { UpdatePlaceInput } from './dto/update-place.input';
import { Place } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import {
  CatchBaseCreateError,
  CatchBaseFindOrThrowError,
  CatchBaseUpdateError,
  CatchBaseRemoveError,
} from 'src/common/helpers/baseErrorHelper';

@Injectable()
export class PlacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPlaceInput: CreatePlaceInput): Promise<Place> {
    try {
      return await this.prisma.place.create({ data: createPlaceInput });
    } catch (error) {
      return CatchBaseCreateError(error, 'Place', {
        foreignKey: { ownerId: createPlaceInput.ownerId, businessId: createPlaceInput.businessId },
      });
    }
  }

  async findAll(): Promise<Place[]> {
    return await this.prisma.place.findMany();
  }

  async findOne(id: string): Promise<Place | null> {
    return await this.prisma.place.findUnique({ where: { id } });
  }

  async findOneOrThrow(id: string): Promise<Place> {
    try {
      return await this.prisma.place.findUniqueOrThrow({ where: { id } });
    } catch (error) {
      return CatchBaseFindOrThrowError(error, 'Place', id);
    }
  }

  async update(updatePlaceInput: UpdatePlaceInput): Promise<Place> {
    const { id, ...data } = updatePlaceInput;
    try {
      return await this.prisma.place.update({ where: { id }, data });
    } catch (error) {
      return CatchBaseUpdateError(error, 'Place', id);
    }
  }

  async remove(id: string): Promise<Place> {
    try {
      return await this.prisma.place.delete({ where: { id } });
    } catch (error) {
      return CatchBaseRemoveError(error, 'Place', id);
    }
  }
}
