import { ObjectType, Field, ID } from '@nestjs/graphql';
import { BaseModel } from 'src/common/models/base.model';
import { Business as PrismaBusiness } from '@prisma/client';
import { UserDto } from 'src/users/dto/user.dto';

@ObjectType()
export class Business extends BaseModel implements PrismaBusiness {
  @Field(() => String)
  name: string;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  phone: string | null;

  @Field(() => ID)
  ownerId: string;

  @Field(() => UserDto, { nullable: true })
  owner?: UserDto;
}
