import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export abstract class BaseInput {
  @Field(() => ID, { nullable: true })
  id: string;
}
