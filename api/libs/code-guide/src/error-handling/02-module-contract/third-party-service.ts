import { Injectable } from '@nestjs/common';
import { Either, left } from 'fp-ts/Either';

export interface Result {
  name: string;
}

export type ThirdPartyErrors = any;

@Injectable()
export class ThirdPartyService {
  async get(): Promise<Either<ThirdPartyErrors, Result>> {
    return left(undefined);
  }
}
