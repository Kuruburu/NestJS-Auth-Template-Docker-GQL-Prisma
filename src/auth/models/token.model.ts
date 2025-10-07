import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Token {
  @Field(() => String, { description: 'JWT access token' })
  accessToken: string;

  @Field(() => String, { description: 'JWT refresh token' })
  refreshToken: string;

  @Field(() => String, { description: 'JWT refresh token ID' })
  refreshTokenId: string;
}
