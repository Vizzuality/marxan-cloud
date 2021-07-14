import { Injectable } from '@nestjs/common';
import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';
import { assertDefined } from '@marxan/utils';

@Injectable()
export class MarxanConfig {
  readonly binPath: string;

  constructor() {
    const bin = AppConfig.get<string>('marxan.bin');
    assertDefined(bin);
    this.binPath = bin;
  }
}
