import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';

import { WorkerProcessor } from '@marxan-geoprocessing/modules/worker';
import { JobInput } from '@marxan/planning-unit-features';

@Injectable()
export class ScenarioPlanningUnitsFeaturesAggregateProcessor
  implements WorkerProcessor<JobInput, true> {
  async process(job: Job<JobInput, true>): Promise<true> {
    const _scenarioId = job.data.scenarioId;
    return true;
  }
}
