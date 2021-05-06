import { Module } from '@nestjs/common';
import { PlanningUnitsModule } from '../planning-units/planning-units.module';
import { AsyncJobsAdapter } from './adapters/async-jobs-adapter';
import { AnalysisService } from './analysis.service';
import { ArePuidsAllowedPort } from './are-puids-allowed.port';
import { JobStatusPort } from './job-status.port';
import { RequestJobPort } from './request-job.port';

@Module({
  imports: [
    // Base Service for processing entity config
    // Module with Base Service for scenarios_pu_data
    PlanningUnitsModule,
  ],
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
      useValue: {}, // replace with useClass of Service extending (BaseService of scenarios_pu_data) with required functionality
    },
    AnalysisService,
  ],
  exports: [AnalysisService],
})
export class AnalysisModule {}
