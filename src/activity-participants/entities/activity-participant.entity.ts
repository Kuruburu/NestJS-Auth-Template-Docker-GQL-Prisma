import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ActivityParticipant {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
