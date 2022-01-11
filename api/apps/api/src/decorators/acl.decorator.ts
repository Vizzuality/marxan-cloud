import { SetMetadata } from '@nestjs/common';

export const IMPLEMENTS_ACL = Symbol('implementsAcl');
export const IS_MISSING_ACL_IMPLEMENTATION = Symbol('implementsAcl');

/**
 * This decorator flags controllers/endpoints that require user auth
 * and have ACL logic implemented (or that require none beyond a user
 * authenticated being).
 *
 * Endpoints that require user authentication but do not use this
 * decorator are only available to admin users.
 */
export const ImplementsAcl = () => SetMetadata(IMPLEMENTS_ACL, true);

/**
 * @deprecated
 *
 * This decorator is meant to flag controllers/endpoints that
 * use authentication but have not yet had ACLs implemented for.
 * It's basically a way of saying "a human needs to look at this and
 * implement ACL logic for it".
 *
 * Once that's done, replace this decorator with @ImplementsAcl()
 * Endpoints that require auth and implement neither decorators will
 * only be available to admin users.
 */
export const IsMissingAclImplementation = () =>
  SetMetadata(IS_MISSING_ACL_IMPLEMENTATION, true);
