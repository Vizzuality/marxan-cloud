import { Module } from '@nestjs/common';
import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';
import { ApiEventsModule } from '@marxan-api/modules/api-events';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { Project } from '@marxan-api/modules/projects/project.api.entity';

import {
  setPlanningUnitGridEventsFactoryProvider,
  setPlanningUnitGridQueueEventsProvider,
  setPlanningUnitGridQueueProvider,
} from './queue.providers';
import { PlanningUnitGridEventsHandler } from './planning-unit-grid-events.handler';
import { PlanningUnitGridService } from './planning-unit-grid.service';
import { PlanningUnitGridSetSaga } from './planning-unit-grid-set.saga';
import { SetProjectGridFromShapefileHandler } from './set-project-grid-from-shapefile.handler';

@Module({
  imports: [
    QueueApiEventsModule,
    ApiEventsModule,
    CqrsModule,
    TypeOrmModule.forFeature([Project]),
  ],
  providers: [
    setPlanningUnitGridQueueProvider,
    setPlanningUnitGridQueueEventsProvider,
    setPlanningUnitGridEventsFactoryProvider,
    PlanningUnitGridEventsHandler,
    PlanningUnitGridService,
    PlanningUnitGridSetSaga,
    SetProjectGridFromShapefileHandler,
  ],
  exports: [PlanningUnitGridService],
})
export class PlanningUnitGridModule {}
