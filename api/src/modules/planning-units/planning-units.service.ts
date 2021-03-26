import { Logger, Injectable } from '@nestjs/common';

import { Job, Queue, QueueEvents } from 'bullmq';
import * as config from 'config';

import { CreatePlanningUnitsDTO } from './dto/create.planning-units.dto';

/**
 * @see https://docs.bullmq.io/ && https://docs.nestjs.com/techniques/queues
 *
 * @debt Bullmq is expected to be supported soon in the
 * nest.js bull wrapper. In the meanwhile we are using Bullmq
 *
 *
 **/
@Injectable()
export class PlanningUnitsService {
  public readonly queueName: string = 'planning-units';
  private readonly logger: Logger = new Logger(
    `${this.queueName}-queue-publisher`,
  );
  private readonly planningUnitsQueue: Queue = new Queue(this.queueName, {
    ...config.get('redisApi'),
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 1000,
      attempts: 3,
      timeout: 1 * 60 * 1000,
    },
  });
  private readonly queueEvents: QueueEvents = new QueueEvents(
    this.queueName,
    config.get('redisApi'),
  );
  constructor() {
      this.queueEvents.on('completed', (job) => {
      this.logger.log(`this job ${job.jobId} for ${this.queueName} is completed`);
    });
  }

  public async create(creationOptions: CreatePlanningUnitsDTO): Promise<void> {
    await this.planningUnitsQueue.add('create-pu', creationOptions);
  }

  public async onModuleDestroy(): Promise<void> {
    await this.queueEvents.close();
    await this.queueEvents.disconnect();
    await this.planningUnitsQueue.close();
    await this.planningUnitsQueue.disconnect();
  }
}
