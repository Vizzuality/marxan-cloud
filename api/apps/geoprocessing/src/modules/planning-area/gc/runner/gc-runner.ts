import { Injectable } from '@nestjs/common';
import { Executor } from '../executor';

@Injectable()
export class GcRunner implements Executor {
  run(): void {
    return;
  }
}
