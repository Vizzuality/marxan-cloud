export class LockNotFoundError extends Error {
  constructor() {
    super('Lock not found.');
  }
}
