import { Module } from '@nestjs/common';
import { ApiEventsModule } from '../../api-events';
import { CqrsModule } from '@nestjs/cqrs';
import { ScenarioCostSurfaceEventsPort } from '@marxan-api/modules/cost-surface/ports/scenario/scenario-cost-surface-events.port';
import { ScenarioCostSurfaceApiEvents } from '@marxan-api/modules/cost-surface/adapters/scenario/scenario-cost-surface-api-events';

@Module({
  imports: [ApiEventsModule, CqrsModule],
  providers: [
    {
      provide: ScenarioCostSurfaceEventsPort,
      useClass: ScenarioCostSurfaceApiEvents,
    },
  ],
  exports: [ScenarioCostSurfaceEventsPort],
})
export class ScenarioCostSurfaceAdaptersModule {}
