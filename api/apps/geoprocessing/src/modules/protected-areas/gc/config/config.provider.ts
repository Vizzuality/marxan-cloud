import cron from 'cron-validate';
import { GcSettings } from './gc-settings';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ms = require('ms');

export class ConfigProvider {
  readonly maxAgeInMs: number;
  readonly cronExpression: string;
  readonly enabled: boolean;

  constructor(cfg: GcSettings) {
    this.enabled = Boolean(cfg.gcOn);
    const cronResult = cron(cfg.cronExpression);

    if (this.enabled && cronResult.isError()) {
      throw new Error(
        `${
          cfg.cronExpression
        } is not a valid cron expression. ${cronResult.getError().join(',')}`,
      );
    }
    this.cronExpression = cfg.cronExpression;
    this.maxAgeInMs = ms(cfg.maxAgeForOrphanUploads);
    if (!ms(this.maxAgeInMs)) {
      throw new Error(`Max age isn't a valid value.`);
    }
  }
}
