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
import { Scenario } from '../scenario.api.entity';
import {
  ScenariosPlanningUnitGeoEntity,
  ScenariosPuOutputGeoEntity,
  ProtectionStatusModule,
} from '@marxan/scenarios-planning-unit';
import { DbConnections } from '@marxan-api/ormconfig.connections';

import { SelectionGetService } from './selection/selection-get.service';
import { SelectionUpdateService } from './selection/selection-update.service';

@Module({
  imports: [
    QueueApiEventsModule,
    ApiEventsModule,
    CqrsModule,
    ProtectionStatusModule.for(DbConnections.geoprocessingDB),
    TypeOrmModule.forFeature(
      [
        ProtectedArea,
        ScenariosPlanningUnitGeoEntity,
        ScenariosPuOutputGeoEntity,
      ],
      apiConnections.geoprocessingDB.name,
    ),

    TypeOrmModule.forFeature([Scenario]),
    PlanningAreasModule,
  ],
  providers: [
    AddProtectedAreaHandler,
    ProtectedAreaService,
    SelectionGetService,
    SelectionUpdateService,
    scenarioProtectedAreaQueueProvider,
    scenarioProtectedAreaQueueEventsProvider,
    scenarioProtectedAreaEventsFactoryProvider,
  ],
  exports: [ProtectedAreaService],
})
export class ProtectedAreaModule {}
