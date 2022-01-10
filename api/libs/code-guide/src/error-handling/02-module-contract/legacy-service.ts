import { Injectable } from '@nestjs/common';
import { Either, left } from 'fp-ts/Either';

export type MagicActionErrors = any;
export type MagicActionSuccess = true;

@Injectable()
export class LegacyService {
  async doSomething(): Promise<Either<MagicActionErrors, MagicActionSuccess>> {
    return left(null);
  }
}
