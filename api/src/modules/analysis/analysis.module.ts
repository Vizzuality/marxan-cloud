import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PlanningUnitsModule } from '../planning-units/planning-units.module';
import { DbConnections } from '../../ormconfig.connections';

import { ScenariosPlanningUnitModule } from '../scenarios-planning-unit/scenarios-planning-unit.module';
import { AdjustCostSurface } from './entry-points/adjust-cost-surface';

import { AdjustPlanningUnits } from './entry-points/adjust-planning-units';
import { GetScenarioStatus } from './entry-points/get-scenario-status';
import { UpdateCostSurfaceService } from './providers/cost-surface/update-cost-surface.service';
import { ArePuidsAllowedAdapter } from './providers/shared/adapters/are-puids-allowed-adapter';
import { ArePuidsAllowedPort } from './providers/shared/are-puids-allowed.port';
import { UpdatePlanningUnitsService } from './providers/planning-units/update-planning-units.service';
import { ScenarioStatusService } from './providers/status/scenario-status.service';
import { RequestJobPort } from './providers/planning-units/request-job.port';
import { AsyncJobsAdapter } from './providers/planning-units/adapters/async-jobs-adapter';
import { CostSurfaceRepo } from './providers/cost-surface/cost-surface-repo';
import { TypeormCostSurface } from './providers/cost-surface/adapters/typeorm-cost-surface';
import { QueueModule } from '../queue/queue.module';
import { queueName } from './queue-name';
import { ScenariosPuCostDataGeo } from './providers/cost-surface/adapters/scenarios-pu-cost-data.geo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ScenariosPuCostDataGeo],
      DbConnections.geoprocessingDB,
    ),
    ScenariosPlanningUnitModule,
    PlanningUnitsModule,
    QueueModule.register({
      name: queueName,
    }),
  ],
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
    // internals - should be in adapters.module
    {
      provide: ArePuidsAllowedPort,
      useClass: ArePuidsAllowedAdapter,
    },
    {
      provide: RequestJobPort,
      useClass: AsyncJobsAdapter,
    },
    {
      provide: CostSurfaceRepo,
      useClass: TypeormCostSurface,
    },
  ],
  exports: [AdjustCostSurface, AdjustPlanningUnits, GetScenarioStatus],
})
export class AnalysisModule {}
