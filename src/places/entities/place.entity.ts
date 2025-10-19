import { ObjectType, Field, Float, ID } from '@nestjs/graphql';
import { BaseModel } from 'src/common/models/base.model';
import { Place as PrismaPlace } from '@prisma/client';

@ObjectType()
export class Place extends BaseModel implements PrismaPlace {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => String)
  city: string;

  @Field(() => String)
  address: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field(() => String, { nullable: true })
  imageUrl: string | null;

  @Field(() => ID, { nullable: true })
  ownerId: string | null;

  @Field(() => ID, { nullable: true })
  businessId: string | null;
}
