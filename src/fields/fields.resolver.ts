import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FieldsService } from './fields.service';
import { Field } from './entities/field.entity';
import { CreateFieldInput } from './dto/create-field.input';
import { UpdateFieldInput } from './dto/update-field.input';

@Resolver(() => Field)
export class FieldsResolver {
  constructor(private readonly fieldsService: FieldsService) {}

  @Mutation(() => Field)
  createField(@Args('createFieldInput') createFieldInput: CreateFieldInput) {
    return this.fieldsService.create(createFieldInput);
  }

  @Query(() => [Field], { name: 'fields' })
  findAll() {
    return this.fieldsService.findAll();
  }

  @Query(() => Field, { name: 'field' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.fieldsService.findOne(id);
  }

  @Mutation(() => Field)
  updateField(@Args('updateFieldInput') updateFieldInput: UpdateFieldInput) {
    return this.fieldsService.update(updateFieldInput.id, updateFieldInput);
  }

  @Mutation(() => Field)
  removeField(@Args('id', { type: () => Int }) id: number) {
    return this.fieldsService.remove(id);
  }
}
