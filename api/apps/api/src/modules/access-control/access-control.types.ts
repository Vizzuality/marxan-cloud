export type Allowed = true;
export type Denied = false;
export type Permit = Allowed | Denied;

export const forbiddenError = Symbol(`unauthorized access`);
export const lastOwner = Symbol(
  'there must be at least one owner of the entity',
);
