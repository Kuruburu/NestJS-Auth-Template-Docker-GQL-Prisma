import { InputType, Field, ID } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { IsString, IsEmail, IsOptional, IsUUID, IsPhoneNumber } from 'class-validator';

@InputType()
export class CreateBusinessInput implements Prisma.BusinessUncheckedCreateInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsPhoneNumber('PL')
  phone?: string;

  @Field(() => ID)
  @IsUUID()
  ownerId: string;
}
