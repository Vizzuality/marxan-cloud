import { Injectable } from '@nestjs/common';
import { Either, left } from 'fp-ts/Either';

export interface Result {
  name: string;
}

export const notReachable = Symbol(`external service not reachable`);
export const timeout = Symbol(`external service timed out`);

export type ThirdPartyErrors = typeof notReachable | typeof timeout;

@Injectable()
export class ThirdPartyService {
  async get(): Promise<Either<ThirdPartyErrors, Result>> {
    return left(notReachable);
  }
}
