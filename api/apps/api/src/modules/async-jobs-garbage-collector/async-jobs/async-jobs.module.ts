import { ApiEventsModule } from '@marxan-api/modules/api-events';
import { Module } from '@nestjs/common';
import { GridAsyncJob } from './project-async-jobs/grid-async-job';
import { LegacyImportAsyncJob } from './project-async-jobs/legacy-import.async-job';
import { PlanningUnitsAsyncJob } from './project-async-jobs/planning-units.async-job';
import { ProjectCloneAsyncJob } from './project-async-jobs/project-clone.async-job';
import { ProjectExportAsyncJob } from './project-async-jobs/project-export.async-job';
import { ProjectImportAsyncJob } from './project-async-jobs/project-import.async-job';
import { CalibrationAsyncJob } from './scenario-async-jobs/calibration.async-job';
import { CostSurfaceAsyncJob } from './scenario-async-jobs/cost-surface.async-job';
import { FeaturesWithPuIntersectionAsyncJob } from './scenario-async-jobs/features-with-pu-intersection.async-job';
import { PlanningAreaProtectedCalculationAsyncJob } from './scenario-async-jobs/planning-area-protected-calculations.async-job';
import { PlanningUnitsInclusionAsyncJob } from './scenario-async-jobs/planning-units-inclusion.async-job';
import { ProtectedAreasAsyncJob } from './scenario-async-jobs/protected-areas.async-job';
import { RunAsyncJob } from './scenario-async-jobs/run.async-job';
import { ScenarioCloneAsyncJob } from './scenario-async-jobs/scenario-clone.async-job';
import { ScenarioExportAsyncJob } from './scenario-async-jobs/scenario-export.async-job';
import { ScenarioImportAsyncJob } from './scenario-async-jobs/scenario-import.async-job';
import { SpecificationAsyncJob } from './scenario-async-jobs/specification.async-job';

const asyncJobs = [
  GridAsyncJob,
  LegacyImportAsyncJob,
  PlanningUnitsAsyncJob,
  ProjectCloneAsyncJob,
  ProjectExportAsyncJob,
  ProjectImportAsyncJob,
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
];

@Module({
  imports: [ApiEventsModule],
  providers: asyncJobs,
  exports: asyncJobs,
})
export class AsyncJobsModule {}
