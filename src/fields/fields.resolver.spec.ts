import { Test, TestingModule } from '@nestjs/testing';
import { FieldsResolver } from './fields.resolver';
import { FieldsService } from './fields.service';
import { CreateFieldInput } from './dto/create-field.input';
import { UpdateFieldInput } from './dto/update-field.input';
import { Field } from '@prisma/client';

const mockField: Field = {
  id: 'field-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'test-field',
  description: 'field-1-description',
  imageUrl: null,
  placeId: 'place-1',
};

const input: CreateFieldInput = {
  name: 'new-field',
  placeId: 'place-1',
  sportsIds: ['sport-1', 'sport-2'],
};

const updateInput: UpdateFieldInput = { id: 'field-1', name: 'Updated field' };

describe('FieldsResolver', () => {
  let resolver: FieldsResolver;
  let service: FieldsService;

  const mockFieldsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findOneOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldsResolver, { provide: FieldsService, useValue: mockFieldsService }],
    }).compile();

    resolver = module.get<FieldsResolver>(FieldsResolver);
    service = module.get<FieldsService>(FieldsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createPlace', () => {
    it('should call service.create and return the result', async () => {
      mockFieldsService.create.mockResolvedValue(mockField);

      const result = await resolver.createField(input);

      expect(service.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockField);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return the result', async () => {
      mockFieldsService.findAll.mockResolvedValue([mockField]);

      const result = await resolver.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockField]);
    });
  });

  describe('findOne', () => {
    it('should call service.findOneOrThrow with id and return the result', async () => {
      mockFieldsService.findOneOrThrow.mockResolvedValue(mockField);

      const result = await resolver.findOne('place-1');

      expect(service.findOneOrThrow).toHaveBeenCalledWith('place-1');
      expect(result).toEqual(mockField);
    });
  });

  describe('updatePlace', () => {
    it('should call service.update with update input and return the result', async () => {
      mockFieldsService.update.mockResolvedValue({ ...mockField, name: updateInput.name });

      const result = await resolver.updateField(updateInput);

      expect(service.update).toHaveBeenCalledWith(updateInput);
      expect(result).toEqual({ ...mockField, name: updateInput.name });
    });
  });

  describe('removePlace', () => {
    it('should call service.remove with id and return the result', async () => {
      mockFieldsService.remove.mockResolvedValue(mockField);

      const result = await resolver.removeField('place-1');

      expect(service.remove).toHaveBeenCalledWith('place-1');
      expect(result).toEqual(mockField);
    });
  });
});
