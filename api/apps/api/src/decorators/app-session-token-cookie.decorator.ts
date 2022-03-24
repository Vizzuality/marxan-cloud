import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const appSessionTokenCookieName = 'next-auth.session-token';
const appSessionTokenCookieNameSecure = '__Secure-next-auth.session-token';
/**
 * Extract NextJS session token from request Cookie header. This will typically
 * be useful for API endpoints that receive requests for the webshot service, as
 * the frontend app will supply a fresh app session token that is later used by
 * the webshot service to pass through the application's own auth.
 *
 * Extract `__Secure-` cookie if available, fall back to plain if not: in
 * practice, only one of these should be provided among the cookies received.
 *
 * As the combinations of webshot targets (`baseUrl`) and app from which a
 * webshot request may originate will vary greatly between environments
 * (especially local dev environments, or environments spread between Vercel and
 * Azure, for example) we _then_ forward to the target app, via the webshot
 * service, the same session token both as secure and non-secure cookie, to
 * cover all possible setups.
 */
export const AppSessionTokenCookie = createParamDecorator(
  (_data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const sessionToken =
      request.cookies?.[appSessionTokenCookieNameSecure] ??
      request.cookies?.[appSessionTokenCookieName];

    return sessionToken
      ? `${appSessionTokenCookieNameSecure}=${sessionToken}; ${appSessionTokenCookieName}=${sessionToken}`
      : undefined;
  },
);
