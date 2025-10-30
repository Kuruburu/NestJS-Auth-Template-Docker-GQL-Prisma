import { CreateActivityParticipantInput } from './create-activity-participant.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateActivityParticipantInput extends PartialType(CreateActivityParticipantInput) {
  @Field(() => ID)
  id: string;
}
