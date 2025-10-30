import { InputType, Field, ID } from '@nestjs/graphql';
import { ActivityParticipant } from '@prisma/client';
import { IsOptional, IsUUID } from 'class-validator';

@InputType()
export class FindManyActivityParticipantInput implements Partial<ActivityParticipant> {
  @Field(() => ID)
  @IsOptional()
  @IsUUID()
  activityId?: string;

  @Field(() => ID)
  @IsOptional()
  @IsUUID()
  userId?: string;
}
