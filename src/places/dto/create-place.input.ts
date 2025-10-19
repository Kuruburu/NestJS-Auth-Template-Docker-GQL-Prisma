import { InputType, Field, Float } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { IsLatitude, IsLongitude, IsString, IsUrl, IsUUID, Length } from 'class-validator';

@InputType()
export class CreatePlaceInput implements Prisma.PlaceUncheckedCreateInput {
  @Field(() => String)
  @IsString()
  @Length(2, 100)
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @Length(2, 300)
  description?: string | null | undefined;

  @Field(() => String)
  @IsString()
  @Length(2, 300)
  city: string;

  @Field(() => String)
  @IsString()
  @Length(2, 300)
  address: string;

  @Field(() => Float)
  @IsLatitude()
  latitude: number;

  @Field(() => Float)
  @IsLongitude()
  longitude: number;

  @Field(() => String, { nullable: true })
  @IsUrl()
  imageUrl?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  ownerId?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  businessId?: string;
}
