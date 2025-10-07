import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MinLength } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SignupInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  @IsStrongPassword()
  password: string;

  @Field(() => String, { nullable: false })
  @IsString()
  firstName: string;

  @Field(() => String, { nullable: false })
  @IsString()
  lastName: string;
}
