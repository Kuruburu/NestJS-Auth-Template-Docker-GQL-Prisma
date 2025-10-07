import { Resolver, Mutation, Args, Parent, ResolveField, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './models/auth.model';
import { Token } from './models/token.model';
import { LoginInput } from './dto/login.input';
import { SignupInput } from './dto/signup.input';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserDto } from 'src/users/dto/user.dto';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Mutation(() => Auth)
  async signup(@Args('data') data: SignupInput) {
    const tokens = await this.auth.signUp(data);
    return tokens;
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Mutation(() => Auth)
  async login(@CurrentUser() user: UserDto, @Args('data') loginInput: LoginInput) {
    const tokens = await this.auth.login(user, loginInput.rememberMe);
    return tokens;
  }

  @Public()
  @Mutation(() => Token)
  async refreshToken(@Args('data') refreshTokenInput: RefreshTokenInput) {
    return await this.auth.rotateTokens(refreshTokenInput);
  }

  @ResolveField('user', () => UserDto)
  async user(@Parent() auth: Auth) {
    return await this.auth.getUserFromToken(auth.accessToken);
  }

  @Query(() => String)
  jwt(@CurrentUser() user: UserDto): string {
    return `Hello ${user.firstName} ${user.lastName}!`;
  }

  @Roles('ADMIN')
  @Query(() => String)
  roleAdmin(@CurrentUser() user: UserDto): string {
    return `Hello ${user.role}!`;
  }

  @Roles('USER')
  @Query(() => String)
  roleUser(@CurrentUser() user: UserDto): string {
    return `Hello ${user.role}!`;
  }
  @Roles('TEACHER')
  @Query(() => String)
  roleTeacher(@CurrentUser() user: UserDto): string {
    return `Hello ${user.role}!`;
  }
}
