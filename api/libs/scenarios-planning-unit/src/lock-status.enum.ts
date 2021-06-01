export enum LockStatus {
  Unstated = 'unstated',

  /**
   * is always guaranteed to be tagged as included in the planning solution
   */
  LockedIn = 'locked-in',
  LockedOut = 'locked-out',
}
