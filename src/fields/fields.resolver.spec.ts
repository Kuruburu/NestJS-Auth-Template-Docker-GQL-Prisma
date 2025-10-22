import { Test, TestingModule } from '@nestjs/testing';
import { FieldsResolver } from './fields.resolver';
import { FieldsService } from './fields.service';

describe('FieldsResolver', () => {
  let resolver: FieldsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldsResolver, FieldsService],
    }).compile();

    resolver = module.get<FieldsResolver>(FieldsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
