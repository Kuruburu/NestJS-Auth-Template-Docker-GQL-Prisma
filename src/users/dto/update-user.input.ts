import { SignupInput } from './signup.input';
import { InputType, Field, PartialType, OmitType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput extends PartialType(OmitType(SignupInput, ['password'] as const)) {
  @Field(() => String)
  id: string;
}
