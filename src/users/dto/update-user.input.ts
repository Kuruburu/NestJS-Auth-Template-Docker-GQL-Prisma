import { Exclude } from 'class-transformer';
import { SignupInput } from './signup.input';
import { InputType, Field, Int, PartialType, OmitType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput extends PartialType(OmitType(SignupInput, ['password'] as const)) {
  @Field(() => Int)
  id: number;
}
