import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

type Identifier = string | object;
interface BaseErrorProps {
  identifier?: Identifier;
  foreignKey?: object;
}

/**
 * Generate a readable identifier message
 */
function formatIdentifier(identifier: Identifier) {
  if (typeof identifier === 'string') return `ID ${identifier}`;
  return formatObejctToStringWithKeyValuePairs(identifier);
}

/**
 * Converts an object into a formatted string of key-value pairs joined with "or".
 *
 * Each entry in the object is transformed into a string in the format:
 * `"key - value"`, and all such pairs are concatenated with the word "or".
 *
 * @example
 * const obj = { color: 'red', size: 'medium', shape: 'circle' };
 * const result = formatObjectToStringWithKeyValuePairs(obj);
 * console.log(result);
 * // Output:
 * // "color - red or size - medium or shape - circle"
 */
function formatObejctToStringWithKeyValuePairs(object: object) {
  const arrayOfPossibleFKeys = Object.entries(object).reduce((acc, [key, value]) => {
    const stringKeyValuePair = `${key} - ${value}`;
    return [...acc, stringKeyValuePair];
  }, []);
  const fKeysJoinedWithOr = arrayOfPossibleFKeys.join('or');
  return fKeysJoinedWithOr;
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
  foreignKey?: object;
}

/**
 * Handles and normalizes Prisma errors that occur during "create" operations.
 *
 * This helper inspects `PrismaClientKnownRequestError` codes and throws a more meaningful
 * NestJS HTTP exception (`BadRequestException` or `InternalServerErrorException`).
 *
 * It specifically handles:
 * - **P2002** → Unique constraint violations (e.g. a record with the same unique field already exists)
 * - **P2003** → Foreign key constraint failures (e.g. referencing a non-existent related record)
 *
 * Any other Prisma or unknown error will result in an `InternalServerErrorException`.
 *
 * ---
 *
 * @param {unknown} error - The original Prisma or runtime error thrown during a create operation.
 * @param {string} model - The model name (e.g. `"User"`, `"Business"`, `"Sport"`) used for readable messages.
 * @param {BaseErrorProps} baseErrorProps - An optional object providing context for formatting error messages.
 * @param {object} [baseErrorProps.identifier] - A unique field or set of fields identifying the record that caused the conflict.
 * @param {object} [baseErrorProps.foreignKey] - A foreign key or set of keys that caused the constraint violation.
 *
 * @throws {BadRequestException} When Prisma error codes `P2002` or `P2003` are encountered.
 * @throws {InternalServerErrorException} For all other or unknown errors.
 *
 * @example
 * try {
 *   await prisma.user.create({
 *     data: { email: 'john@example.com', username: 'john_doe' },
 *   });
 * } catch (error) {
 *   return CatchBaseCreateError(error, 'User', { identifier: { email: 'john@example.com' } });
 * }
 *
 * // Example thrown error:
 * // BadRequestException: "User with email - john@example.com already exists"
 *
 * @example
 * try {
 *   await prisma.order.create({
 *     data: { userId: 'non-existent-user-id', total: 100 },
 *   });
 * } catch (error) {
 *   return CatchBaseCreateError(error, 'Order', { foreignKey: { userId: 'non-existent-user-id' } });
 * }
 *
 * // Example thrown error:
 * // BadRequestException: "Invalid foreign key: userId - non-existent-user-id related record not found"
 */
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
          `Invalid foreign key: ${foreignKey && formatObejctToStringWithKeyValuePairs(foreignKey)} related record not found`,
        );

      default:
        throw new BadRequestException(error.message);
    }
  }
  throw new InternalServerErrorException(`Failed to create ${model}`, { cause: error });
};
