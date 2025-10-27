import { CreateActivityInput } from './create-activity.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateActivityInput extends PartialType(CreateActivityInput) {
  @Field(() => ID)
  id: string;
}
