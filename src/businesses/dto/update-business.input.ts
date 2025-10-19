import { CreateBusinessInput } from './create-business.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateBusinessInput extends PartialType(CreateBusinessInput) {
  @Field(() => ID)
  id: string;
}
