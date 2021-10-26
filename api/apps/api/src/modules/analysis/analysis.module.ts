import { Module } from '@nestjs/common';
import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';
import { updateQueueName } from '@marxan-jobs/planning-unit-geometry';
import { PlanningUnitsModule } from '@marxan-api/modules/planning-units/planning-units.module';
import { ScenariosPlanningUnitModule } from '@marxan-api/modules/scenarios-planning-unit/scenarios-planning-unit.module';

import { AdjustPlanningUnits } from './entry-points/adjust-planning-units';
import { ArePuidsAllowedAdapter } from './providers/shared/adapters/are-puids-allowed-adapter';
import { ArePuidsAllowedPort } from './providers/shared/are-puids-allowed.port';
import { UpdatePlanningUnitsService } from './providers/planning-units/update-planning-units.service';
import { RequestJobPort } from './providers/planning-units/request-job.port';
import { AsyncJobsAdapter } from './providers/planning-units/adapters/async-jobs-adapter';
import { QueueModule } from '../queue/queue.module';
import { UpdatePlanningUnitsApiEvents } from './providers/planning-units/adapters/update-planning-units-api-events';
import { UpdatePlanningUnitsEventsPort } from './providers/planning-units/update-planning-units-events.port';

@Module({
  imports: [
    ApiEventsModule,
    ScenariosPlanningUnitModule,
    PlanningUnitsModule,
    QueueModule.register({
      name: updateQueueName,
    }),
  ],
  providers: [
    {
      provide: AdjustPlanningUnits,
      useClass: UpdatePlanningUnitsService,
    },
    UpdatePlanningUnitsService,
    // internals - should be in adapters.module
    {
      provide: UpdatePlanningUnitsEventsPort,
      useClass: UpdatePlanningUnitsApiEvents,
    },
    {
      provide: ArePuidsAllowedPort,
      useClass: ArePuidsAllowedAdapter,
    },
    {
      provide: RequestJobPort,
      useClass: AsyncJobsAdapter,
    },
  ],
  exports: [AdjustPlanningUnits],
})
export class AnalysisModule {}
