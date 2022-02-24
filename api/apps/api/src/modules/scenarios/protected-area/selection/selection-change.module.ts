import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DbConnections } from '@marxan-api/ormconfig.connections';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { PlanningAreasModule } from '@marxan-api/modules/planning-areas';
import { ProtectedArea } from '@marxan/protected-areas';
import { ProtectionStatusModule } from '@marxan/scenarios-planning-unit';

import { SelectionGetterModule } from '../getter/selection-getter.module';

import { SelectionUpdateService } from './selection-update.service';
import { SelectionChangedSaga } from './selection-changed.saga';
import { UpdatePlanningUnitsHandler } from './update-planning-units.handler';
import { ApiEventsModule } from '@marxan-api/modules/api-events';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Scenario]),
    TypeOrmModule.forFeature([ProtectedArea], DbConnections.geoprocessingDB),
    ProtectionStatusModule.for(DbConnections.geoprocessingDB),
    PlanningAreasModule,
    SelectionGetterModule,
    ApiEventsModule,
  ],
  providers: [
    SelectionUpdateService,
    UpdatePlanningUnitsHandler,
    SelectionChangedSaga,
  ],
  exports: [SelectionUpdateService],
})
export class SelectionChangeModule {}
