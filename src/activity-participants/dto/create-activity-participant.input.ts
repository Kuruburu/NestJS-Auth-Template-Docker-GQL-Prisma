import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateActivityParticipantInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
