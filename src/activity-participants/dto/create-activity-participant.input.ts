import { InputType, Field, ID } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { IsUUID } from 'class-validator';

@InputType()
export class CreateActivityParticipantInput implements Prisma.ActivityParticipantUncheckedCreateInput {
  @Field(() => ID)
  @IsUUID()
  activityId: string;

  @Field(() => ID)
  @IsUUID()
  userId: string;
}
