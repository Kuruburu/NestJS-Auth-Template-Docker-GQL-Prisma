import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { SignupInput } from './dto/signup.input';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserDto } from 'src/users/dto/user.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() data: SignupInput) {
    const tokens = await this.authService.signUp(data);
    const user = await this.authService.getUserFromToken(tokens.accessToken);
    return { ...tokens, user };
  }

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  async login(@CurrentUser() user: UserDto, @Body() loginInput: LoginInput) {
    const tokens = await this.authService.login(user, loginInput.rememberMe);
    return { ...tokens, user };
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenInput: RefreshTokenInput) {
    const tokens = await this.authService.rotateTokens(refreshTokenInput);
    return { ...tokens };
  }

  @Get('test/jwt')
  jwt(@CurrentUser() user: UserDto): string {
    return `Hello ${user.firstName} ${user.lastName}!`;
  }

  @Roles('ADMIN')
  @Get('test/admin')
  roleAdmin(@CurrentUser() user: UserDto): string {
    return `Hello ${user.role}!`;
  }

  @Roles('USER')
  @Get('test/user')
  roleUser(@CurrentUser() user: UserDto): string {
    return `Hello ${user.role}!`;
  }
  @Roles('TEACHER')
  @Get('test/teacher')
  roleTeacher(@CurrentUser() user: UserDto): string {
    return `Hello ${user.role}!`;
  }
  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@CurrentUser() user: UserDto, @Res() res: Response) {
    const tokens = await this.authService.login(user, false);
    res.redirect(`http://localhost:3000?token=${tokens.accessToken}`);
  }
}
