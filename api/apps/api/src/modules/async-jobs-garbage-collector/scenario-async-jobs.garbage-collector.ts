import { Injectable } from '@nestjs/common';
import {
  CalibrationAsyncJob,
  CostSurfaceAsyncJob,
  FeaturesWithPuIntersectionAsyncJob,
  PlanningAreaProtectedCalculationAsyncJob,
  PlanningUnitsInclusionAsyncJob,
  ProtectedAreasAsyncJob,
  RunAsyncJob,
  ScenarioCloneAsyncJob,
  ScenarioExportAsyncJob,
  ScenarioImportAsyncJob,
  SpecificationAsyncJob,
} from './async-jobs';
import { AsyncJobsGarbageCollector } from './async-jobs.garbage-collector';

@Injectable()
export class ScenarioAsyncJobsGarbageCollector
  implements AsyncJobsGarbageCollector
{
  constructor(
    private readonly calibrationAsyncJob: CalibrationAsyncJob,
    private readonly costSurfaceAsyncJob: CostSurfaceAsyncJob,
    private readonly featuresWithPuIntersectionAsyncJob: FeaturesWithPuIntersectionAsyncJob,
    private readonly planningAreaProtectedCalculationAsyncJob: PlanningAreaProtectedCalculationAsyncJob,
    private readonly planningUnitsInclusionAsyncJob: PlanningUnitsInclusionAsyncJob,
    private readonly protectedAreasAsyncJob: ProtectedAreasAsyncJob,
    private readonly runAsyncJob: RunAsyncJob,
    private readonly scenarioCloneAsyncJob: ScenarioCloneAsyncJob,
    private readonly scenarioExportAsyncJob: ScenarioExportAsyncJob,
    private readonly scenarioImportAsyncJob: ScenarioImportAsyncJob,
    private readonly specificationAsyncJob: SpecificationAsyncJob,
  ) {}
  public async sendFailedApiEventsForStuckAsyncJobs(scenarioId: string) {
    await this.calibrationAsyncJob.sendFailedApiEventForStuckAsyncJob(
      scenarioId,
    );
    await this.costSurfaceAsyncJob.sendFailedApiEventForStuckAsyncJob(
      scenarioId,
    );
    await this.featuresWithPuIntersectionAsyncJob.sendFailedApiEventForStuckAsyncJob(
      scenarioId,
    );
    await this.planningAreaProtectedCalculationAsyncJob.sendFailedApiEventForStuckAsyncJob(
      scenarioId,
    );
    await this.planningUnitsInclusionAsyncJob.sendFailedApiEventForStuckAsyncJob(
      scenarioId,
    );
    await this.runAsyncJob.sendFailedApiEventForStuckAsyncJob(scenarioId);
    await this.scenarioCloneAsyncJob.sendFailedApiEventForStuckAsyncJob(
      scenarioId,
    );
    await this.scenarioExportAsyncJob.sendFailedApiEventForStuckAsyncJob(
      scenarioId,
    );
    await this.scenarioImportAsyncJob.sendFailedApiEventForStuckAsyncJob(
      scenarioId,
    );
    await this.specificationAsyncJob.sendFailedApiEventForStuckAsyncJob(
      scenarioId,
    );
  }
}
