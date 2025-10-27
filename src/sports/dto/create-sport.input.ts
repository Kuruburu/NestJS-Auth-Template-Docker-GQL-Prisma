import { InputType, Int, Field } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { IsInt, Min, Max, Validate, IsPositive, IsString, Length, IsOptional, IsUrl } from 'class-validator';
import { MinLessThanMax } from 'src/common/validation/custom-class-validation';

@InputType()
export class CreateSportInput implements Prisma.SportCreateInput {
  @IsString()
  @Length(2, 50)
  @Field(() => String)
  name: string;

  @IsString()
  @IsOptional()
  @Length(2, 300)
  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => Int)
  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(50)
  @Validate(MinLessThanMax)
  minPlayers: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(2)
  @Max(999)
  maxPlayers?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
