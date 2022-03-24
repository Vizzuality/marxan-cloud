import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract NextJS session token from request Cookie header. This will typically
 * be useful for API endpoints that receive requests for the webshot service, as
 * the frontend app will supply a fresh app session token that is later used by
 * the webshot service to pass through the application's own auth.
 *
 * Use `__Secure-` cookie if available, fall back to plain if not. This may be
 * useful when working in local dev environments without HTTPS termination in
 * front of the frontend app
 */
export const AppSessionToken = createParamDecorator(
  (_data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return (
      request.cookies?.['__Secure-next-auth.session-token'] ??
      request.cookies?.['next-auth.session-token'] ??
      undefined
    );
  },
);
