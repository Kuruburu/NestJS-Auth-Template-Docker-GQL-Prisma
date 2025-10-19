import { Injectable } from '@nestjs/common';
import { CreateBusinessInput } from './dto/create-business.input';
import { UpdateBusinessInput } from './dto/update-business.input';
import { PrismaService } from 'nestjs-prisma';
import {
  CatchBaseCreateError,
  CatchBaseFindOrThrowError,
  CatchBaseRemoveError,
  CatchBaseUpdateError,
} from 'src/common/helpers/baseErrorHelper';
import { Business } from './entities/business.entity';

@Injectable()
export class BusinessesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createBusinessInput: CreateBusinessInput): Promise<Business> {
    try {
      return await this.prisma.business.create({ data: createBusinessInput });
    } catch (error) {
      return CatchBaseCreateError(error, 'Business', {
        foreignKey: { field: 'ownerId', value: createBusinessInput.ownerId },
      });
    }
  }

  async findAll(): Promise<Business[]> {
    return await this.prisma.business.findMany();
  }

  async findOne(id: string): Promise<Business | null> {
    return await this.prisma.business.findUnique({ where: { id } });
  }

  async findOneOrThrow(id: string): Promise<Business> {
    try {
      return await this.prisma.business.findUniqueOrThrow({ where: { id } });
    } catch (error) {
      return CatchBaseFindOrThrowError(error, 'Business', id);
    }
  }

  async update(updateBusinessInput: UpdateBusinessInput): Promise<Business> {
    const { id, ...data } = updateBusinessInput;
    try {
      return await this.prisma.business.update({ where: { id }, data });
    } catch (error) {
      return CatchBaseUpdateError(error, 'Business', id);
    }
  }

  async remove(id: string): Promise<Business> {
    try {
      return await this.prisma.business.delete({ where: { id } });
    } catch (error) {
      return CatchBaseRemoveError(error, 'Business', id);
    }
  }
}
