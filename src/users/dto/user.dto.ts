// user.dto.ts
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { BaseModel } from 'src/common/models/base.model';
import { Role } from '../../common/models/role.enum';

@ObjectType()
export class UserDto extends BaseModel implements Omit<User, 'passwordHash'> {
  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String)
  email: string;

  @Field(() => Role)
  role: Role;

  @Exclude()
  passwordHash: string;

  constructor(partial: Partial<UserDto>) {
    super();
    Object.assign(this, partial);
  }
}
