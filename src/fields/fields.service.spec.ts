import { Test, TestingModule } from '@nestjs/testing';
import { FieldsService } from './fields.service';
import { Field, Sport } from '@prisma/client';
import { CreateFieldInput } from './dto/create-field.input';
import { PrismaService } from 'nestjs-prisma';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  CatchBaseCreateError,
  CatchBaseFindOrThrowError,
  CatchBaseRemoveError,
} from 'src/common/helpers/baseErrorHelper';
import { FieldWithSports } from './interfaces/fieldWithSports';
import { includeSports } from 'src/common/helpers/prismaHelper';
import { FieldWithNestedSports } from 'src/common/helpers/mapFieldWithSports';
import { UpdateFieldInput } from './dto/update-field.input';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

jest.mock('src/common/helpers/baseErrorHelper', () => ({
  CatchBaseUpdateError: jest.fn(),
  CatchBaseRemoveError: jest.fn(),
  CatchBaseFindOrThrowError: jest.fn(),
  CatchBaseCreateError: jest.fn(),
}));

const sportArray: Sport[] = [
  {
    id: 'sport-1',
    name: 'Football',
    description: 'Play a match with friends on turf or grass.',
    minPlayers: 10,
    maxPlayers: 22,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sport-2',
    name: 'Basketball',
    description: '5v5 classic streetball or indoor.',
    minPlayers: 6,
    maxPlayers: 10,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sport-3',
    name: 'Tennis',
    description: 'Singles or doubles court play.',
    minPlayers: 2,
    maxPlayers: 4,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const formattedField: FieldWithSports = {
  id: 'field-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'test-field',
  description: 'field-1-description',
  imageUrl: null,
  placeId: 'place-1',
  sports: sportArray,
};

const prismaReturnValue: FieldWithNestedSports = {
  id: 'field-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'test-field',
  description: 'field-1-description',
  imageUrl: null,
  placeId: 'place-1',
  sports: sportArray.map((sport) => ({ sport })),
};

const input: CreateFieldInput = {
  name: 'new-field',
  placeId: 'place-1',
  sportsIds: [sportArray[0].id, sportArray[1].id, sportArray[2].id],
};

describe('FieldsService', () => {
  let service: FieldsService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldsService, { provide: PrismaService, useValue: mockDeep<PrismaService>() }],
    }).compile();

    service = module.get<FieldsService>(FieldsService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a field successfully', async () => {
      prisma.field.create.mockResolvedValue(prismaReturnValue);
      const { sportsIds, ...data } = input;

      const result = await service.create(input);

      expect(prisma.field.create).toHaveBeenCalledWith({
        data: {
          ...data,
          sports: sportsIds
            ? { create: sportsIds.map((sportId) => ({ sport: { connect: { id: sportId } } })) }
            : undefined,
        },
        include: includeSports,
      });
      expect(result).toEqual({ ...prismaReturnValue, sports: sportArray });
    });

    it('should call CatchBaseCreateError on create error', async () => {
      const error = new Error('Create failed');
      prisma.field.create.mockRejectedValue(error);

      await service.create(input);

      expect(CatchBaseCreateError).toHaveBeenCalledWith(error, 'Field', {
        foreignKey: {
          placeId: input.placeId,
          sportsIds: input.sportsIds,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all Fields', async () => {
      const fields: Field[] = [prismaReturnValue];
      prisma.field.findMany.mockResolvedValue(fields);

      const result = await service.findAll();

      expect(prisma.field.findMany).toHaveBeenCalled();
      expect(result).toEqual([formattedField]);
    });
  });

  describe('findOne', () => {
    it('should return one field', async () => {
      prisma.field.findUnique.mockResolvedValue(prismaReturnValue);

      const result = await service.findOne(formattedField.id);

      expect(prisma.field.findUnique).toHaveBeenCalledWith({
        where: { id: formattedField.id },
        include: includeSports,
      });
      expect(result).toEqual(formattedField);
    });

    it('should return null if not found', async () => {
      prisma.field.findUnique.mockResolvedValue(null);

      const result = await service.findOne('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('findOneOrThrow', () => {
    it('should return field if found', async () => {
      prisma.field.findUniqueOrThrow.mockResolvedValue(prismaReturnValue);

      const result = await service.findOneOrThrow(formattedField.id);

      expect(prisma.field.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: formattedField.id },
        include: includeSports,
      });
      expect(result).toEqual(formattedField);
    });

    it('should call CatchBaseFindUniqueOrThrowError on failure', async () => {
      const error = new PrismaClientKnownRequestError('error', { code: 'P2025', clientVersion: '6.9' });
      prisma.field.findUniqueOrThrow.mockRejectedValue(error);

      await service.findOneOrThrow(formattedField.id);

      expect(CatchBaseFindOrThrowError).toHaveBeenCalledWith(error, 'Field', formattedField.id);
    });
  });
  //
  describe('update', () => {
    const updateFieldInput: UpdateFieldInput = { id: formattedField.id, name: 'updated field' };
    it('should update a field successfully', async () => {
      prisma.field.update.mockResolvedValue({ ...prismaReturnValue, name: updateFieldInput.name as string });

      const result = await service.update(updateFieldInput);

      expect(prisma.field.update).toHaveBeenCalledWith({
        where: { id: updateFieldInput.id },
        data: { name: updateFieldInput.name },
        include: includeSports,
      });
      expect(result).toEqual({ ...formattedField, name: updateFieldInput.name as string });
    });

    it('should throw NotFoundException', async () => {
      const notFoundError = new PrismaClientKnownRequestError('', { code: 'P2025', clientVersion: '' });
      prisma.field.update.mockRejectedValue(notFoundError);

      await expect(service.update(updateFieldInput)).rejects.toThrow(NotFoundException);

      expect(prisma.field.update).toHaveBeenCalledWith({
        where: { id: updateFieldInput.id },
        data: { name: updateFieldInput.name },
        include: includeSports,
      });
    });

    it('should throw internal server error on db failure', async () => {
      const error = new Error('Update failed');
      prisma.field.update.mockRejectedValue(error);

      await expect(service.update(updateFieldInput)).rejects.toThrow(InternalServerErrorException);

      expect(prisma.field.update).toHaveBeenCalledWith({
        where: { id: updateFieldInput.id },
        data: { name: updateFieldInput.name },
        include: includeSports,
      });
    });

    it('should throw BadRequestException failure', async () => {
      const badRequestError = new PrismaClientKnownRequestError('', { code: 'P2003', clientVersion: '' });
      prisma.field.update.mockRejectedValue(badRequestError);

      await expect(service.update(updateFieldInput)).rejects.toThrow(BadRequestException);

      expect(prisma.field.update).toHaveBeenCalledWith({
        where: { id: updateFieldInput.id },
        data: { name: updateFieldInput.name },
        include: includeSports,
      });
    });
  });
  //
  describe('remove', () => {
    it('should delete a field successfully', async () => {
      prisma.field.delete.mockResolvedValue(prismaReturnValue);

      const result = await service.remove(formattedField.id);

      expect(prisma.field.delete).toHaveBeenCalledWith({ where: { id: formattedField.id }, include: includeSports });
      expect(result).toEqual(formattedField);
    });

    it('should call CatchBaseRemoveError on delete failure', async () => {
      const error = new Error('Delete failed');
      prisma.field.delete.mockRejectedValue(error);

      await service.remove('b1');

      expect(CatchBaseRemoveError).toHaveBeenCalledWith(error, 'Field', 'b1');
    });
  });
});
