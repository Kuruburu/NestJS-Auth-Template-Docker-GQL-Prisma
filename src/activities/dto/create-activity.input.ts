import { InputType, Field, Float, ID } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { IsBoolean, IsDate, IsNumber, IsOptional, IsPositive, IsUUID, Validate } from 'class-validator';
import {
  StartNotInPast,
  StartBeforeEnd,
  PriceRequiresPayment,
  MinLessThanMax,
} from 'src/common/validation/custom-class-validation';

@InputType()
export class CreateActivityInput implements Prisma.ActivityUncheckedCreateInput {
  @Field(() => ID)
  @IsUUID()
  fieldId: string;

  @Field(() => ID)
  @IsUUID()
  sportId: string;

  @Field(() => Date)
  @IsDate()
  @Validate(StartNotInPast)
  startTime: Date;

  @Field(() => Date)
  @IsDate()
  @Validate(StartBeforeEnd)
  endTime: Date;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  paymentRequired?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Validate(PriceRequiresPayment)
  price?: number;

  @Field(() => Number)
  @IsNumber()
  @IsPositive()
  @Validate(MinLessThanMax)
  minPlayers: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsPositive()
  @Validate(MinLessThanMax)
  maxPlayers?: number;
}
