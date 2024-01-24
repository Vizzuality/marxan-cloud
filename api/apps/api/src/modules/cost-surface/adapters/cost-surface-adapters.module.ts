import { Module } from '@nestjs/common';
import { ApiEventsModule } from '../../api-events';
import { CostSurfaceEventsPort } from '../ports/cost-surface-events.port';
import { CostSurfaceApiEvents } from './cost-surface-api-events';
import { CostSurfaceCalculationPort } from '@marxan-api/modules/cost-surface/ports/project/cost-surface-calculation.port';
import { CostSurfaceCalculation } from '@marxan-api/modules/cost-surface/adapters/project/cost-surface-commands';
import { CqrsModule } from '@nestjs/cqrs';
import { ProjectCostSurfaceEventsPort } from '@marxan-api/modules/cost-surface/ports/project/project-cost-surface-events.port';
import { ProjectCostSurfaceApiEvents } from '@marxan-api/modules/cost-surface/adapters/project/project-cost-surface-api-events';

/**
 * @deprecated
 */
@Module({
  imports: [ApiEventsModule],
  providers: [
    {
      provide: CostSurfaceEventsPort,
      useClass: CostSurfaceApiEvents,
    },
  ],
  exports: [CostSurfaceEventsPort],
})
export class CostSurfaceAdaptersModule {}

@Module({
  imports: [ApiEventsModule, CqrsModule],
  providers: [
    {
      provide: ProjectCostSurfaceEventsPort,
      useClass: ProjectCostSurfaceApiEvents,
    },
    {
      provide: CostSurfaceCalculationPort,
      useClass: CostSurfaceCalculation,
    },
  ],
  exports: [ProjectCostSurfaceEventsPort, CostSurfaceCalculationPort],
})
export class ProjectCostSurfaceAdaptersModule {}
