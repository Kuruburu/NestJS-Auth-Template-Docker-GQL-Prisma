import { SignupInput } from './signup.input';
import { InputType, Field, PartialType, OmitType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput extends PartialType(OmitType(SignupInput, ['password'] as const)) {
  @Field(() => ID)
  id: string;
}
