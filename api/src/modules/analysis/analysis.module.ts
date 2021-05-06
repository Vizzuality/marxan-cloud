import { Module } from '@nestjs/common';
import { PlanningUnitsModule } from '../planning-units/planning-units.module';
import { ScenariosPlanningUnitModule } from '../scenarios-planning-unit/scenarios-planning-unit.module';
import { ArePuidsAllowedAdapter } from './adapters/are-puids-allowed-adapter';

import { AsyncJobsAdapter } from './adapters/async-jobs-adapter';
import { AnalysisService } from './analysis.service';

import { ArePuidsAllowedPort } from './are-puids-allowed.port';
import { JobStatusPort } from './job-status.port';
import { RequestJobPort } from './request-job.port';

@Module({
  imports: [ScenariosPlanningUnitModule, PlanningUnitsModule],
  providers: [
    {
      provide: RequestJobPort,
      useClass: AsyncJobsAdapter,
    },
    {
      provide: JobStatusPort,
      useClass: AsyncJobsAdapter,
    },
    {
      provide: ArePuidsAllowedPort,
      useClass: ArePuidsAllowedAdapter,
    },
    AnalysisService,
  ],
  exports: [AnalysisService],
})
export class AnalysisModule {}
