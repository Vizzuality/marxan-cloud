import { Logger, Module } from '@nestjs/common';
import { QueueModule } from '@marxan-api/modules/queue/queue.module';
import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';

import { CostSurfaceFacade } from './cost-surface.facade';
import { CostSurfaceEventsPort } from './cost-surface-events.port';
import { CostSurfaceApiEvents } from './adapters/cost-surface-api-events';

import { queueName } from './queue-name';

@Module({
  imports: [
    ApiEventsModule,
    QueueModule.register({
      name: queueName,
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
