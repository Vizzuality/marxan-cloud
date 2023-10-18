import { WorkerProcessor } from '@marxan-geoprocessing/modules/worker';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  LinkCostSurfaceToScenarioJobInput,
  ScenarioCostSurfaceJobInput,
} from '@marxan/artifact-cache/surface-cost-job-input';
import { ScenarioCostSurfacePersistencePort } from '@marxan-geoprocessing/modules/cost-surface/ports/persistence/scenario-cost-surface-persistence.port';

@Injectable()
export class ScenarioCostSurfaceProcessor
  implements WorkerProcessor<ScenarioCostSurfaceJobInput, true> {
  constructor(private readonly repo: ScenarioCostSurfacePersistencePort) {}

  private async linkCostSurfaceToScenario({
    data,
  }: Job<LinkCostSurfaceToScenarioJobInput, true>): Promise<true> {
    await this.repo.linkScenarioToCostSurface(
      data.scenarioId,
      data.costSurfaceId,
    );

    return true;
  }

  async process(job: Job<ScenarioCostSurfaceJobInput, true>): Promise<true> {
    if (job.data.type === 'LinkCostSurfaceToScenarioJobInput') {
      return this.linkCostSurfaceToScenario(
        job as Job<LinkCostSurfaceToScenarioJobInput, true>,
      );
    }
    return true;
  }
}
