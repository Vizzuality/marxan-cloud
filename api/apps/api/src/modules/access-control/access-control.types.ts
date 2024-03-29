export type Allowed = true;
export type Denied = false;
export type Permit = Allowed | Denied;

export const forbiddenError = Symbol(`unauthorized access`);
export const lastOwner = Symbol(
  'there must be at least one owner of the entity',
);
export const transactionFailed = Symbol(`transaction failed`);
export const queryFailed = Symbol(`Query failed`);
export const userNotFound = Symbol(`user not found`);

export type ForbiddenError = typeof forbiddenError;
export type LastOwnerError = typeof lastOwner;
export type TransactionFailedError = typeof transactionFailed;
export type QueryFailedError = typeof queryFailed;
export type UserNotFoundError = typeof userNotFound;
export type AclErrors =
  | ForbiddenError
  | LastOwnerError
  | TransactionFailedError
  | QueryFailedError
  | UserNotFoundError;
