export interface User {
  id: string;
  fname?: string;
  lname?: string;
  email: string;
  displayName: string;
  avatarDataUrl?: string;
  isActive: boolean;
  isBlocked: boolean;
  isDeleted: boolean;
  isAdmin: boolean;
  metadata: unknown;
  type: 'users';
}
