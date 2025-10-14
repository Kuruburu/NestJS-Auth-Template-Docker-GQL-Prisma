import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export const CatchBaseUpdateError = (error: any, model: string, id: string) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      throw new NotFoundException(`${model} with ID ${id} not found`);
    }
    throw new BadRequestException(error.message);
  }
  throw new InternalServerErrorException(`Failed to update ${model} with ID ${id}`);
};

export const CatchBaseRemoveError = (error: any, model: string, id: string) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    throw new NotFoundException(`${model} with ID ${id} not found`);
  }
  throw new InternalServerErrorException(`Failed to remove ${model} with ID ${id}`);
};

export const CatchBaseFindUniqueOrThrowError = (error: any, model: string, id: string) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    throw new NotFoundException(`${model} with ID ${id} not found`);
  }
  throw new InternalServerErrorException(`Failed find ${model} with ID ${id}`);
};
