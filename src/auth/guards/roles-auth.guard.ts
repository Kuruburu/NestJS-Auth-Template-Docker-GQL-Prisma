import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '@prisma/client';
import { ROLES_KEY } from 'src/common/constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // no roles required
    }

    // 🔑 Normalize the request (works for REST & GraphQL)
    let req: { user?: User };
    if (context.getType<'graphql'>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      req = gqlCtx.getContext().req;
    } else {
      req = context.switchToHttp().getRequest();
    }

    const user = req.user;
    if (!user) {
      throw new ForbiddenException('User not found in request context.');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `You do not have permission to access this resource. Required: ${requiredRoles.join(', ')}, got: ${user.role}`,
      );
    }

    return true;
  }
}
