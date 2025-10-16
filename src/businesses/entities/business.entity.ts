import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Business {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
