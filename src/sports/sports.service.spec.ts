import { Test, TestingModule } from '@nestjs/testing';
import { SportsService } from './sports.service';
import { InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  CatchBaseFindUniqueOrThrowError,
  CatchBaseRemoveError,
  CatchBaseUpdateError,
} from 'src/common/helpers/baseErrorHelper';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, Sport } from '@prisma/client';
import { UpdateSportInput } from './dto/update-sport.input';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

jest.mock('src/common/helpers/baseErrorHelper', () => ({
  CatchBaseUpdateError: jest.fn(),
  CatchBaseRemoveError: jest.fn(),
  CatchBaseFindUniqueOrThrowError: jest.fn(),
}));

describe('SportsService', () => {
  let service: SportsService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SportsService, { provide: PrismaService, useValue: mockDeep<PrismaClient>() }],
    }).compile();

    prisma = module.get(PrismaService);
    service = module.get<SportsService>(SportsService);
  });

  const mockSport: Sport = {
    id: 'sport-1',
    name: 'Volleyball',
    description: null,
    minPlayers: 0,
    maxPlayers: null,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a sport successfully', async () => {
      const input = {
        name: 'Basketball',
        minPlayers: 5,
        maxPlayers: 10,
        description: null,
        id: 'sport-1',
      };
      const createdSport: Sport = {
        ...input,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.sport.create.mockResolvedValue(createdSport);

      const result = await service.create(input);

      expect(prisma.sport.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual(createdSport);
    });

    it('should throw InternalServerErrorException on create error', async () => {
      prisma.sport.create.mockRejectedValue(new Error('DB fail'));

      await expect(service.create({ name: 'Football', minPlayers: 10 })).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return all sports', async () => {
      const sports: Sport[] = [mockSport];
      prisma.sport.findMany.mockResolvedValue(sports);

      const result = await service.findAll();

      expect(prisma.sport.findMany).toHaveBeenCalled();
      expect(result).toEqual(sports);
    });
  });

  describe('findOne', () => {
    it('should return one sport', async () => {
      prisma.sport.findUnique.mockResolvedValue(mockSport);

      const result = await service.findOne(mockSport.id);

      expect(prisma.sport.findUnique).toHaveBeenCalledWith({ where: { id: mockSport.id } });
      expect(result).toEqual(mockSport);
    });

    it('should return null if not found', async () => {
      prisma.sport.findUnique.mockResolvedValue(null);

      const result = await service.findOne('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('findOneOrThrow', () => {
    it('should return sport if found', async () => {
      prisma.sport.findUniqueOrThrow.mockResolvedValue(mockSport);

      const result = await service.findOneOrThrow(mockSport.id);
      expect(result).toEqual(mockSport);
    });

    it('should call CatchBaseFindUniqueOrThrowError on failure', async () => {
      const error = new PrismaClientKnownRequestError('error', { code: 'P2025', clientVersion: '6.9' });
      prisma.sport.findUniqueOrThrow.mockRejectedValue(error);

      await service.findOneOrThrow(mockSport.id);

      expect(CatchBaseFindUniqueOrThrowError).toHaveBeenCalledWith(error, 'Sport', mockSport.id);
    });
  });

  describe('update', () => {
    const updateSportInput: UpdateSportInput = { id: mockSport.id, name: 'Updated Tennis' };
    it('should update a sport successfully', async () => {
      const updatedSport: Sport = { ...mockSport, name: updateSportInput.name as string };
      prisma.sport.update.mockResolvedValue(updatedSport);

      const result = await service.update(updateSportInput);

      expect(prisma.sport.update).toHaveBeenCalledWith({
        where: { id: updateSportInput.id },
        data: { name: updateSportInput.name },
      });
      expect(result).toEqual(updatedSport);
    });

    it('should call CatchBaseUpdateError on update failure', async () => {
      const error = new Error('Update failed');
      prisma.sport.update.mockRejectedValue(error);

      await service.update(updateSportInput);

      expect(CatchBaseUpdateError).toHaveBeenCalledWith(error, 'Sport', updateSportInput.id);
    });
  });

  describe('remove', () => {
    it('should delete a sport successfully', async () => {
      prisma.sport.delete.mockResolvedValue(mockSport);

      const result = await service.remove(mockSport.id);

      expect(prisma.sport.delete).toHaveBeenCalledWith({ where: { id: mockSport.id } });
      expect(result).toEqual(mockSport);
    });

    it('should call CatchBaseRemoveError on delete failure', async () => {
      const error = new Error('Delete failed');
      prisma.sport.delete.mockRejectedValue(error);

      await service.remove('s1');

      expect(CatchBaseRemoveError).toHaveBeenCalledWith(error, 'Sport', 's1');
    });
  });
});
