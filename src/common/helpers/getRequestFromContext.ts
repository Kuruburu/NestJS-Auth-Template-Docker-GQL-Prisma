import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export function getRequestFromContext(context: ExecutionContext) {
  if (context.getType<'graphql'>() === 'graphql') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return GqlExecutionContext.create(context).getContext().req;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return context.switchToHttp().getRequest();
}
