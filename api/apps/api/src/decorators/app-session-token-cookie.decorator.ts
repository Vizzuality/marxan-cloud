
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AppSessionToken = createParamDecorator(
  (_data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.cookies?.['__Secure-next-auth.session-token'] ?? request.cookies?.['next-auth.session-token'] ?? undefined;
  },
);