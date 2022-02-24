import * as config from 'config';
import { Injectable } from '@nestjs/common';
import { WorkerOptions } from 'bullmq';
import { getRedisConfig } from '@marxan-geoprocessing/utils/redisConfig.utils';

@Injectable()
export class Config {
  public readonly redis: WorkerOptions;

  constructor() {
    this.redis = {
      ...getRedisConfig(),
      concurrency: config.get('redis.concurrency'),
    };
  }
}
