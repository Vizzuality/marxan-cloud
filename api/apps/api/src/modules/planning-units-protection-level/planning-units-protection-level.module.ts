import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';
import { CalculatePlanningUnitsProtectionLevelHandler } from './calculate-planning-units-protection-level.handler';
import { QueueModule } from '../queue/queue.module';
import { queueName } from './queue.name';

/**
 * Usage:
 *
 * 1 import CqrsModule in your module
 * 2 add `private readonly commandBus: CommandBus` to your service constructor
 * 3 `this.commandBus.execute(new RequestPuWdpaRefresh())
 *
 * Trigger the command According to requirements
 *
 */

@Module({
  imports: [
    CqrsModule,
    QueueModule.register({
      name: queueName,
    }),
    ApiEventsModule,
  ],
  providers: [CalculatePlanningUnitsProtectionLevelHandler],
})
export class PlanningUnitsProtectionLevelModule {}
