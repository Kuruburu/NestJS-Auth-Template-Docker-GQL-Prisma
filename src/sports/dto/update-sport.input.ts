import { CreateSportInput } from './create-sport.input';
import { Field, InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateSportInput extends PartialType(CreateSportInput) {
  @Field(() => String)
  id: string;
}
