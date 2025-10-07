import { ObjectType } from '@nestjs/graphql';
import { Token } from './token.model';
import { UserDto } from 'src/users/dto/user.dto';

@ObjectType()
export class Auth extends Token {
  user: UserDto;
}
