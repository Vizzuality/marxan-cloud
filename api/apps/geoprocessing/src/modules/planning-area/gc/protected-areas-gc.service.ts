import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

import { ConfigProvider } from './config/config.provider';
import { gcConfigToken } from './config/config.token';

import { Executor } from './executor';
import { cronjobName } from './cronjob-name';

@Injectable()
export class ProtectedAreasGcService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(gcConfigToken) private readonly gcSettings: ConfigProvider,
    private schedulerRegistry: SchedulerRegistry,
    private readonly executor: Executor,
  ) {}

  onModuleDestroy(): void {
    if (this.schedulerRegistry.doesExists('cron', cronjobName)) {
      this.schedulerRegistry.deleteCronJob(cronjobName);
    }
  }

  onModuleInit(): void {
    if (!this.gcSettings.enabled) {
      return;
    }
    const job = new CronJob(this.gcSettings.cronExpression, () => {
      this.executor.run();
    });
    this.schedulerRegistry.addCronJob(cronjobName, job);
    job.start();
  }
}
