import { Injectable } from '@nestjs/common';
import { Worker } from 'bullmq';

import { WorkerBuilder } from '@marxan-geoprocessing/modules/worker';
import { queueName } from '@marxan/planning-unit-features';

import { ScenarioPlanningUnitsFeaturesAggregateProcessor } from './scenario-planning-units-features-aggregate-processor';

@Injectable()
export class ScenarioPlanningUnitsFeaturesAggregateWorker {
  #worker: Worker;

  constructor(
    private readonly wrapper: WorkerBuilder,
    private readonly processor: ScenarioPlanningUnitsFeaturesAggregateProcessor,
  ) {
    this.#worker = wrapper.build(queueName, processor);
  }
}
