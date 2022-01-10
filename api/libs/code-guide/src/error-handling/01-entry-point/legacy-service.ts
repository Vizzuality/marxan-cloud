import { Injectable } from '@nestjs/common';

@Injectable()
export class LegacyService {
  async doSomething() {
    throw new Error(`You are not allowed to do so, sorry!`);
  }
}
