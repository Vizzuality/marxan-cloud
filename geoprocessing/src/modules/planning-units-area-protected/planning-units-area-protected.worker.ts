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
 **/
@Injectable()
export class CalculatePlanningUnitAreaProtectedProcessor {
  private readonly queueName: string = 'planning-units-protection-level';
  private readonly logger: Logger = new Logger(
    CalculatePlanningUnitAreaProtectedProcessor.name,
  );
  public readonly worker: Worker = new Worker(
    this.queueName,
    join(__dirname, './planning-units-area-protected.job.ts'),
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
