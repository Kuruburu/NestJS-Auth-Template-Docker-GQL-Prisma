import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/constants';
import { AuthGuard } from '@nestjs/passport';
import { getRequestFromContext } from 'src/common/helpers/getRequestFromContext';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    // Check for public route
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    // Otherwise call the default AuthGuard logic
    return super.canActivate(context);
  }

  getRequest(context: ExecutionContext) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return getRequestFromContext(context);
  }

  // handleRequest<TUser = any>(err: any, user: any, info: any, _context: ExecutionContext, _status?: any): TUser {
  //   if (err || !user) {
  //     // `info` is provided by passport-jwt and often contains why it failed
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //     if (info?.name === 'TokenExpiredError') {
  //       throw new UnauthorizedException('JWT has expired');
  //     }
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //     if (info?.name === 'JsonWebTokenError') {
  //       throw new UnauthorizedException('Invalid JWT');
  //     }
  //     throw new UnauthorizedException('Unauthorized jwt');
  //   }
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  //   return user;
  // }
}
