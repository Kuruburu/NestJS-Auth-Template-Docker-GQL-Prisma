import { ObjectType, Field as FieldType, ID } from '@nestjs/graphql';
import { Field as PrismaField } from '@prisma/client';
import { BaseModel } from 'src/common/models/base.model';
import { Sport } from 'src/sports/entities/sport.entity';

@ObjectType()
export class Field extends BaseModel implements PrismaField {
  @FieldType(() => String)
  name: string;

  @FieldType(() => String, { nullable: true })
  description: string | null;

  @FieldType(() => String, { nullable: true })
  imageUrl: string | null;

  @FieldType(() => ID)
  placeId: string;

  @FieldType(() => [Sport])
  sports: Sport[];
}
