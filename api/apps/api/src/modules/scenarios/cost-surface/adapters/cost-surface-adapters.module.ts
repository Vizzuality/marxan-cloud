import { Module } from '@nestjs/common';
import { ApiEventsModule } from '../../../api-events';
import { CostSurfaceEventsPort } from '../ports/cost-surface-events.port';
import { CostSurfaceApiEvents } from './cost-surface-api-events';

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
