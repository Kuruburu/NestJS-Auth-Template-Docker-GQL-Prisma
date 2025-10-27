import { InputType, Field, Float } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { IsLatitude, IsLongitude, IsOptional, IsString, IsUrl, IsUUID, Length } from 'class-validator';

@InputType()
export class CreatePlaceInput implements Prisma.PlaceUncheckedCreateInput {
  @Field(() => String)
  @IsString()
  @Length(2, 100)
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
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
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  businessId?: string;
}
