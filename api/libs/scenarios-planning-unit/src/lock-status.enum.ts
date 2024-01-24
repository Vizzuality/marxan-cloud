export enum LockStatus {
  Available = 'available',

  /**
   * is always guaranteed to be tagged as included in the planning solution
   */
  LockedIn = 'locked-in',
  LockedOut = 'locked-out',
}
