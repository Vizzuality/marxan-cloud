import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Worker } from 'bullmq';
import { WorkerBuilder } from '@marxan-geoprocessing/modules/worker';
import { ProjectCostSurfaceProcessor } from '@marxan-geoprocessing/modules/cost-surface/application/project-cost-surface.processor';
import { projectCostSurfaceQueueName } from '@marxan/artifact-cache/cost-surface-queue-name';

@Injectable()
export class ProjectCostSurfaceWorker {
  #worker: Worker;

  constructor(
    private readonly wrapper: WorkerBuilder,
    private readonly processor: ProjectCostSurfaceProcessor,
    private readonly eventBus: EventBus,
  ) {
    this.#worker = wrapper.build(projectCostSurfaceQueueName, processor);
  }
}
