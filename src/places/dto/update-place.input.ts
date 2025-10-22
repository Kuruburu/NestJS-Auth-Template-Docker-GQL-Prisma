import { CreatePlaceInput } from './create-place.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdatePlaceInput extends PartialType(CreatePlaceInput) {
  @Field(() => ID)
  id: string;
}
