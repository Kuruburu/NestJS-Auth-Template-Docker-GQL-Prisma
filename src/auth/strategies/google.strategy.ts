import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { OAuthConfig } from 'src/common/configs/config.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private authService: AuthService,
  ) {
    const googleOauthWebConfig = configService.getOrThrow<OAuthConfig>('OAuthConfig').WEB;
    const { clientId, clientSecret, callbackUrl } = googleOauthWebConfig;
    super({
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
    if (!profile.emails?.length) {
      return done(new UnauthorizedException('Google account has no email'));
    }

    try {
      const user = await this.authService.validateProvidedUser({
        email: profile.emails[0].value,
        firstName: profile.name?.givenName ?? 'google-firstName-unresolved',
        lastName: profile.name?.familyName ?? 'google-lastName-unresolved',
        provider: 'GOOGLE',
        providerId: profile.id,
      });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
}
