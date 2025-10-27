import { ObjectType, Field, Float } from '@nestjs/graphql';
import { Activity as PrismaActivity } from '@prisma/client';
import { BaseModel } from 'src/common/models/base.model';

@ObjectType()
export class Activity extends BaseModel implements PrismaActivity {
  @Field(() => String)
  fieldId: string;

  @Field(() => String)
  sportId: string;

  @Field(() => Date)
  startTime: Date;

  @Field(() => Date)
  endTime: Date;

  @Field(() => Boolean)
  paymentRequired: boolean;

  @Field(() => Float, { nullable: true })
  price: number | null;

  @Field(() => Number)
  minPlayers: number;

  @Field(() => Number, { nullable: true })
  maxPlayers: number | null;
}
