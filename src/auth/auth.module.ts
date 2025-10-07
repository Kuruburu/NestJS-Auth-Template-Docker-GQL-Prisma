import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PasswordService } from './password.service';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { SecurityConfig } from '../common/configs/config.interface';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles-auth.guard';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GoogleStrategy } from './strategies/google.strategy';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const securityConfig = configService.getOrThrow<SecurityConfig>('security');
        return {
          secret: securityConfig.jwtAccessSecret,
          signOptions: {
            expiresIn: securityConfig.expiresIn || '2m',
          },
        };
      },
      inject: [ConfigService],
      global: true,
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    GqlAuthGuard,
    LocalAuthGuard,
    GoogleAuthGuard,
    RolesGuard,
    PasswordService,
    UsersService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  controllers: [AuthController],
  exports: [GqlAuthGuard],
})
// eslint-disable-next-line prettier/prettier
export class AuthModule { }
