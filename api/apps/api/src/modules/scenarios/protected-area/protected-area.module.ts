import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';
import { PlanningAreasModule } from '@marxan-api/modules/planning-areas';
import { ApiEventsModule } from '@marxan-api/modules/api-events';

import {
  scenarioProtectedAreaEventsFactoryProvider,
  scenarioProtectedAreaQueueEventsProvider,
  scenarioProtectedAreaQueueProvider,
} from './queue.providers';
import { AddProtectedAreaHandler } from './add-protected-area.handler';
import { ProtectedAreaService } from './protected-area.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProtectedArea } from '@marxan/protected-areas';
import { Scenario } from '../scenario.api.entity';
import {
  ProtectionStatusModule,
  ScenariosPlanningUnitGeoEntity,
  ScenariosPuOutputGeoEntity,
} from '@marxan/scenarios-planning-unit';
import { DbConnections } from '@marxan-api/ormconfig.connections';

import { SelectionGetService } from './selection-get.service';
import { SelectionChangeModule } from './selection/selection-change.module';

@Module({
  imports: [
    QueueApiEventsModule,
    ApiEventsModule,
    CqrsModule,
    TypeOrmModule.forFeature(
      [
        ProtectedArea,
        ScenariosPlanningUnitGeoEntity,
        ScenariosPuOutputGeoEntity,
      ],
      DbConnections.geoprocessingDB,
    ),
    ProtectionStatusModule.for(DbConnections.geoprocessingDB),
    SelectionChangeModule,
    TypeOrmModule.forFeature([Scenario]),
    PlanningAreasModule,
  ],
  providers: [
    AddProtectedAreaHandler,
    ProtectedAreaService,
    SelectionGetService,
    scenarioProtectedAreaQueueProvider,
    scenarioProtectedAreaQueueEventsProvider,
    scenarioProtectedAreaEventsFactoryProvider,
  ],
  exports: [ProtectedAreaService],
})
export class ProtectedAreaModule {}
