import { CreateActivityParticipantInput } from './create-activity-participant.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateActivityParticipantInput extends PartialType(CreateActivityParticipantInput) {
  @Field(() => Int)
  id: number;
}
