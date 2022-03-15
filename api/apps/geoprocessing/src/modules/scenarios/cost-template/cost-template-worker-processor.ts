import { Injectable, Logger } from '@nestjs/common';
import {
  WorkerBuilder,
  WorkerProcessor,
} from '@marxan-geoprocessing/modules/worker';
import { Job, Worker } from 'bullmq';
import { CostTemplateGenerator } from './cost-template-generator';
import { assertDefined } from '@marxan/utils';
import { IsUUID, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export const queueName = 'cost-surface-template-creation';

@Injectable()
export class CostTemplateWorkerProcessor
  implements WorkerProcessor<void, void>
{
  private readonly worker: Worker;
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly costTemplateGenerator: CostTemplateGenerator,
    workerBuilder: WorkerBuilder,
  ) {
    this.worker = workerBuilder.build(queueName, this);
  }

  async process(job: Job<void, void>): Promise<void> {
    const jobId = job.id;
    new Logger().log({ got: jobId });
    assertDefined(jobId);
    await this.validateJob(job);
    await this.costTemplateGenerator
      .createTemplateShapefile(jobId)
      .catch(console.log);
  }

  private async validateJob(job: Job<void, void>) {
    const jobClass = plainToClass(JobValidator, {
      id: job.id,
    });
    const errors = await validate(jobClass);
    if (errors.length > 0) {
      this.logger.warn({
        message: `invalid job`,
        job,
      });
      throw new Error(`invalid job ${jobClass.id}`);
    }
  }
}

class JobValidator {
  @IsUUID()
  id!: string;
}
