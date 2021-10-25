import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';
import { PlanningAreasModule } from '@marxan-api/modules/planning-areas';
import { ApiEventsModule } from '@marxan-api/modules/api-events';

import {
  scenarioProtectedAreaQueueProvider,
  scenarioProtectedAreaQueueEventsProvider,
  scenarioProtectedAreaEventsFactoryProvider,
} from './queue.providers';
import { AddProtectedAreaHandler } from './add-protected-area.handler';
import { ProtectedAreaService } from './protected-area.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProtectedArea } from '@marxan/protected-areas';
import { apiConnections } from '@marxan-api/ormconfig';

@Module({
  imports: [
    QueueApiEventsModule,
    ApiEventsModule,
    CqrsModule,
    TypeOrmModule.forFeature(
      [ProtectedArea],
      apiConnections.geoprocessingDB.name,
    ),
    PlanningAreasModule,
  ],
  providers: [
    AddProtectedAreaHandler,
    ProtectedAreaService,
    scenarioProtectedAreaQueueProvider,
    scenarioProtectedAreaQueueEventsProvider,
    scenarioProtectedAreaEventsFactoryProvider,
  ],
  exports: [ProtectedAreaService],
})
export class ProtectedAreaModule {}
