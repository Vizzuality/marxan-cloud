import { v4, validate, version } from 'uuid';

export class UserId {
  private readonly _token = 'user-id';

  constructor(public readonly value: string) {
    if (!value || !validate(value) || version(value) !== 4) {
      throw new Error(`Invalid UserId: ${value}`);
    }
  }

  static create(): UserId {
    return new UserId(v4());
  }
}
