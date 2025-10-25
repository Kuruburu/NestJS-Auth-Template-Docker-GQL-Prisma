import { CreateFieldInput } from './create-field.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateFieldInput extends PartialType(CreateFieldInput) {
  @Field(() => ID)
  id: string;
}
