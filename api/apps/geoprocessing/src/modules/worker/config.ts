import * as config from 'config';
import { Injectable } from '@nestjs/common';
import { WorkerOptions } from 'bullmq';

@Injectable()
export class Config {
  public readonly redis: WorkerOptions;

  constructor() {
    this.redis = config.get('redisApi');
  }
}
