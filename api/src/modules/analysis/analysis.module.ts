import { Module } from '@nestjs/common';
import { PlanningUnitsModule } from '../planning-units/planning-units.module';
import { ScenariosPlanningUnitModule } from '../scenarios-planning-unit/scenarios-planning-unit.module';

import { AdjustCostSurface } from './entry-points/adjust-cost-surface';
import { AdjustPlanningUnits } from './entry-points/adjust-planning-units';
import { GetScenarioStatus } from './entry-points/get-scenario-status';

import { UpdateCostSurfaceService } from './providers/cost-surface/update-cost-surface.service';
import { ArePuidsAllowedAdapter } from './providers/planning-units/adapters/are-puids-allowed-adapter';
import { ArePuidsAllowedPort } from './providers/planning-units/are-puids-allowed.port';
import { UpdatePlanningUnitsService } from './providers/planning-units/update-planning-units.service';
import { ScenarioStatusService } from './providers/status/scenario-status.service';
import { RequestJobPort } from './providers/planning-units/request-job.port';
import { AsyncJobsAdapter } from './providers/planning-units/adapters/async-jobs-adapter';

@Module({
  imports: [ScenariosPlanningUnitModule, PlanningUnitsModule],
  providers: [
    {
      provide: AdjustCostSurface,
      useClass: UpdateCostSurfaceService,
    },
    {
      provide: AdjustPlanningUnits,
      useClass: UpdatePlanningUnitsService,
    },
    {
      provide: GetScenarioStatus,
      useClass: ScenarioStatusService,
    },
    UpdatePlanningUnitsService,
    UpdateCostSurfaceService,
    // internals
    {
      provide: ArePuidsAllowedPort,
      useClass: ArePuidsAllowedAdapter,
    },
    {
      provide: RequestJobPort,
      useClass: AsyncJobsAdapter,
    },
  ],
  exports: [AdjustCostSurface, AdjustPlanningUnits, GetScenarioStatus],
})
export class AnalysisModule {}
