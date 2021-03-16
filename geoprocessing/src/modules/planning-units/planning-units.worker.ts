import { Logger, Injectable } from '@nestjs/common';
import { Worker, QueueScheduler } from 'bullmq';

@Injectable()
export class PlanningUnitsProcessor {
  private readonly logger = new Logger('planning-units-worker');
  private readonly queueScheduler = new QueueScheduler('planning-units', {
    connection: {
      host: 'marxan-redis',
      port: 6379,
    },
  });
  private readonly worker = new Worker(
    'planning-units',
    __dirname + '/planning-units.job.ts',
    {
      concurrency: 50,
      connection: {
        host: 'marxan-redis',
        port: 6379,
      },
    },
  );
  constructor() {
    this.logger.debug('worker');
  }
}
