import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') implements CanActivate {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const enableGoogle = this.configService.get<boolean>('ENABLE_GOOGLE_AUTH');

    if (!enableGoogle) {
      console.warn('[GoogleAuthGuard] Google Auth disabled – skipping guard');
      return false;
    }

    return (await super.canActivate(context)) as boolean;
  }
}
