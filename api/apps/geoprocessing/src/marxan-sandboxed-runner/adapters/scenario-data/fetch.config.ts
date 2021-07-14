import { Injectable } from '@nestjs/common';
import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';

@Injectable()
export class FetchConfig {
  readonly secret;

  constructor() {
    this.secret = AppConfig.get<string>('auth.xApiKey.secret');
  }
}
