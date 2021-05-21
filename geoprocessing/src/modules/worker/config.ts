import * as config from 'config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Config {
  public readonly redis: {
    connection: {
      host: string;
      port: number;
    };
    concurrency: number;
  };

  constructor() {
    this.redis = config.get('redisApi');
  }
}
