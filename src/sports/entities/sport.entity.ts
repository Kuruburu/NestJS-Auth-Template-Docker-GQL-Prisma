import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Sport as PrismaSport } from '@prisma/client';
import { BaseModel } from 'src/common/models/base.model';

@ObjectType()
export class Sport extends BaseModel implements PrismaSport {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => Int)
  minPlayers: number;

  @Field(() => Int, { nullable: true })
  maxPlayers: number | null;

  @Field(() => String, { nullable: true })
  imageUrl: string | null;
}
