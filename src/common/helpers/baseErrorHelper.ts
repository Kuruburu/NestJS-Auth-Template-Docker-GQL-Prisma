import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

type Identifier = string | { field: string; value: any };

/**
 * Generate a readable identifier message
 */
function formatIdentifier(identifier: Identifier) {
  if (typeof identifier === 'string') return `ID ${identifier}`;
  return `${identifier.field} ${identifier.value}`;
}

/**
 * Catch errors for "find or throw" operations
 */
export const CatchBaseFindOrThrowError = (error: any, model: string, identifier: Identifier) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    throw new NotFoundException(`${model} with ${formatIdentifier(identifier)} not found`);
  }
  throw new InternalServerErrorException(`Failed to find ${model} with ${formatIdentifier(identifier)}`, {
    cause: error,
  });
};

/**
 * Catch errors for "update" operations
 */
export const CatchBaseUpdateError = (error: any, model: string, identifier: Identifier) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2025': // record not found
        throw new NotFoundException(`${model} with ${formatIdentifier(identifier)} not found`);
      case 'P2002': // unique constraint violation
        throw new BadRequestException(`${model} with ${formatIdentifier(identifier)} already exists`);
      default:
        throw new BadRequestException(error.message);
    }
  }
  throw new InternalServerErrorException(`Failed to update ${model} with ${formatIdentifier(identifier)}`, {
    cause: error,
  });
};

/**
 * Catch errors for "delete/remove" operations
 */
export const CatchBaseRemoveError = (error: any, model: string, identifier: Identifier) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    throw new NotFoundException(`${model} with ${formatIdentifier(identifier)} not found`);
  }
  throw new InternalServerErrorException(`Failed to remove ${model} with ${formatIdentifier(identifier)}`, {
    cause: error,
  });
};

/**
 * Catch errors for "create" operations
 * If it has 1 UNIQUE field in the database pass this field as an identifier
 */
interface BaseErrorProps {
  identifier?: Identifier;
  foreignKey?: Identifier;
}
export const CatchBaseCreateError = (error: any, model: string, baseErrorProps: BaseErrorProps) => {
  const { foreignKey, identifier } = baseErrorProps;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // unique constraint violation
        throw new BadRequestException(
          `${model} with ${identifier ? formatIdentifier(identifier) : 'unique value'} already exists`,
        );
      case 'P2003':
        throw new BadRequestException(
          `Invalid foreign key: ${foreignKey && formatIdentifier(foreignKey)} related record not found`,
        );

      default:
        throw new BadRequestException(error.message);
    }
  }
  throw new InternalServerErrorException(`Failed to create ${model}`, { cause: error });
};
