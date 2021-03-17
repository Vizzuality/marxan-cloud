import { Logger, Injectable } from '@nestjs/common';
import { Worker } from 'bullmq';
import { join } from 'path';

/**
 * @see https://docs.bullmq.io/guide/workers
 *
 * @debt Bullmq is expected to be supported soon in the
 * nest.js bull wrapper. In the meanwhile we are using Bullmq
 * in the worker
 * and bull in the Queue and job publication
 *
 **/
@Injectable()
export class PlanningUnitsProcessor {
  private readonly logger: Logger = new Logger('planning-units-worker');
  private readonly worker: Worker = new Worker(
    'planning-units',
    join(__dirname, '/planning-units.job.ts'),
    {
      concurrency: 50,
      connection: {
        host: 'marxan-redis',
        port: 6379,
      },
    },
  );
  constructor() {
    this.logger.debug(`${this.worker.name}-worker`);
    this.worker.on('completed', (job) =>
      this.logger.debug(
        `Completed job ${job.id} successfully, sent email to ${job.data}`,
      ),
    );
  }
}
