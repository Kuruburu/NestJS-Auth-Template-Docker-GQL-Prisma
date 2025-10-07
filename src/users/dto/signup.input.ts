import { InputType, Field } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsStrongPassword, Length } from 'class-validator';

@InputType()
export class SignupInput {
  @Field(() => String)
  @IsNotEmpty()
  firstName: string;

  @Field(() => String)
  @IsNotEmpty()
  lastName: string;

  @Field(() => Role)
  @IsEnum(Role)
  role: Role;

  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  @IsStrongPassword()
  @Length(3)
  password: string;
}
