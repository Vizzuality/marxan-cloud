import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  IMPLEMENTS_ACL,
  IS_MISSING_ACL_IMPLEMENTATION,
} from '@marxan-api/decorators/acl.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const parentResult = await super.canActivate(context);

    if (!parentResult) {
      return false;
    }

    const ctx = context.switchToHttp().getRequest();
    const { user } = ctx;

    const isAdmin: boolean = await JwtAuthGuard.isAdmin(user);

    if (isAdmin) {
      return true;
    }

    const implementsAcl = this.reflector.getAllAndOverride<boolean>(
      IMPLEMENTS_ACL,
      [context.getHandler(), context.getClass()],
    );

    const isMissingAclImplementation =
      this.reflector.getAllAndOverride<boolean>(IS_MISSING_ACL_IMPLEMENTATION, [
        context.getHandler(),
        context.getClass(),
      ]);

    return implementsAcl || isMissingAclImplementation;
  }

  private static async isAdmin(user: Record<string, any>) {
    // TODO: Once MARXAN-1061 is done, implement logic here
    return user === undefined;
  }
}
