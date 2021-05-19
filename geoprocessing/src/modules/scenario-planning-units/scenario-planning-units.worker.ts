import { Logger, Injectable } from '@nestjs/common';
import { Worker, QueueScheduler } from 'bullmq';
import { join } from 'path';
import * as config from 'config';

/**
 * @see https://docs.bullmq.io/guide/workers
 *
 * @debt Bullmq is expected to be supported soon in the
 * nest.js bull wrapper. In the meanwhile we are using Bullmq
 * in the worker
 *
 * @description this job should only be trigger when a scenario is created.
 **/
@Injectable()
export class AttachPlanningUnitGridToScenarioProcessor {
  private readonly queueName: string = 'attach-scenario-planning-units';
  private readonly logger: Logger = new Logger(
    AttachPlanningUnitGridToScenarioProcessor.name,
  );
  public readonly worker: Worker = new Worker(
    this.queueName,
    join(__dirname, '/scenario-planning-units.job.ts'),
    config.get('redisApi'),
  );
  private scheduler: QueueScheduler = new QueueScheduler(
    this.queueName,
    config.get('redisApi'),
  );
  constructor() {
    this.logger.debug('worker');
    this.worker.on('completed', async (job) => {
      this.logger.debug(`Job finished ${JSON.stringify(job)}`);
    });
  }

  public async onModuleDestroy(): Promise<void> {
    await this.scheduler.close();
    await this.scheduler.disconnect();
    await this.worker.close();
    await this.worker.disconnect();
  }
}
