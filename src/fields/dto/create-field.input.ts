import { InputType, Field, ID } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { ArrayNotEmpty, ArrayUnique, IsOptional, IsString, IsUrl, IsUUID, Length } from 'class-validator';

@InputType()
export class CreateFieldInput implements Prisma.FieldUncheckedCreateInput {
  @Field(() => String)
  @IsString()
  @Length(2, 50)
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 300)
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @Field(() => ID)
  @IsUUID()
  placeId: string;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  sportsIds?: string[];
}
