import { Injectable } from '@nestjs/common';
import { Either, left } from 'fp-ts/Either';

export const forbidden = Symbol(`action forbidden`);
export const unknownError = Symbol(`internal error - database integrity`);
export const invalidEmail = Symbol(`provided email is not correct`);

export type MagicActionErrors =
  | typeof forbidden
  | typeof unknownError
  | typeof invalidEmail;
export type MagicActionSuccess = true;

@Injectable()
export class LegacyService {
  async doSomething(): Promise<Either<MagicActionErrors, MagicActionSuccess>> {
    return left(forbidden);
  }
}
