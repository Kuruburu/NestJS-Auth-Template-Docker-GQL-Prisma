import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ActivityParticipant as PrismaActivityParticipant } from '@prisma/client';
import { BaseModel } from 'src/common/models/base.model';

@ObjectType()
export class ActivityParticipant extends BaseModel implements PrismaActivityParticipant {
  @Field(() => ID)
  activityId: string;

  @Field(() => ID)
  userId: string;

  @Field(() => Date)
  joinedAt: Date;
}
