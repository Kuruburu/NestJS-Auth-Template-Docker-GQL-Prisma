import { CreateSportInput } from './create-sport.input';
import { Field, ID, InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateSportInput extends PartialType(CreateSportInput) {
  @Field(() => ID)
  id: string;
}
