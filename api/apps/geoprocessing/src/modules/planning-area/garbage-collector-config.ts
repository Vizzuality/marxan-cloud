import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';
import { FactoryProvider } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ms = require('ms');

export interface GcEnvConfig {
  maxAgeForOrphanUploads: string;
}

export class GarbageCollectorConfig {
  readonly maxAgeInMs: number;

  constructor(cfg: GcEnvConfig) {
    this.maxAgeInMs = ms(cfg.maxAgeForOrphanUploads);
    if (!ms(this.maxAgeInMs)) {
      throw new Error(`Max age isn't a valid value.`);
    }
  }
}

export const gcConfigProvider: FactoryProvider<GarbageCollectorConfig> = {
  provide: GarbageCollectorConfig,
  useFactory: () => {
    const config = AppConfig.get<GcEnvConfig>(
      'fileUploads.projects.planningAreas',
    );
    return new GarbageCollectorConfig(config);
  },
};
