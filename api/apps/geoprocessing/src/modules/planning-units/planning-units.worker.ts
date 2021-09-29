import { Injectable, Logger } from '@nestjs/common';
import { Worker } from 'bullmq';
import { WorkerBuilder } from '@marxan-geoprocessing/modules/worker';
import { PlanningUnitsJobProcessor } from './planning-units.job';
import {
  createQueueName,
  PlanningUnitsJob,
} from '@marxan-jobs/planning-unit-geometry';

/**
 * @see https://docs.bullmq.io/guide/workers
 *
 * @debt Bullmq is expected to be supported soon in the
 * nest.js bull wrapper. In the meanwhile we are using Bullmq
 * in the worker
 *
 **/
@Injectable()
export class PlanningUnitsProcessor {
  private readonly logger: Logger = new Logger(PlanningUnitsProcessor.name);
  private readonly worker: Worker<PlanningUnitsJob, void>;

  constructor(
    private readonly workerBuilder: WorkerBuilder,
    processor: PlanningUnitsJobProcessor,
  ) {
    this.worker = workerBuilder.build<PlanningUnitsJob, void>(
      createQueueName,
      processor,
    );
    this.worker.on(`completed`, (job) => {
      this.logger.log(`Planning units job #${job.id} completed`);
    });
    this.worker.on(`failed`, (job) => {
      this.logger.log(`Planning units job #${job.id} failed`);
    });
  }
}
