import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { WorkerProcessor } from '@marxan-geoprocessing/modules/worker';
import { JobInput } from '@marxan-jobs/planning-unit-geometry';

@Injectable()
export class ScenarioPlanningUnitsInclusionProcessor
  implements WorkerProcessor<JobInput, true> {
  async process(_job: Job<JobInput, true>): Promise<true> {
    return true;
  }
}
