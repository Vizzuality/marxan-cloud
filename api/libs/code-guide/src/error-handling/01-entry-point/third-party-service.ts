import { Injectable } from '@nestjs/common';

export interface Result {
  name: string;
}

@Injectable()
export class ThirdPartyService {
  async get(): Promise<Result | undefined> {
    return undefined;
  }
}
