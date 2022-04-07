import { v4, version, validate } from 'uuid';

export class UserId {
  private readonly _token = 'user-id';
  constructor(public readonly value: string) {
    if (!validate(value) || version(value) !== 4) {
      throw new Error();
    }
  }

  static create(): UserId {
    return new UserId(v4());
  }
}
