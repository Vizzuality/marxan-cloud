import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';
import { QueueModule } from '@marxan-api/modules/queue/queue.module';
import { surfaceCostQueueName } from '@marxan/scenarios-planning-unit';
import { Logger, Module } from '@nestjs/common';
import { CostSurfaceApiEvents } from './adapters/cost-surface-api-events';
import { CostSurfaceEventsPort } from './cost-surface-events.port';
import { CostSurfaceFacade } from './cost-surface.facade';

@Module({
  imports: [
    ApiEventsModule,
    QueueModule.register({
      name: surfaceCostQueueName,
    }),
  ],
  providers: [
    Logger,
    CostSurfaceFacade,
    {
      provide: CostSurfaceEventsPort,
      useClass: CostSurfaceApiEvents,
    },
  ],
  exports: [CostSurfaceFacade],
})
export class CostSurfaceModule {}
