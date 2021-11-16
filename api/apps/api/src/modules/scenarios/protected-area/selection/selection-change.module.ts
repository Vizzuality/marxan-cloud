import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DbConnections } from '@marxan-api/ormconfig.connections';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { PlanningAreasModule } from '@marxan-api/modules/planning-areas';
import { ProtectedArea } from '@marxan/protected-areas';
import { ProtectionStatusModule } from '@marxan/scenarios-planning-unit';

import { SelectionGetService } from '../selection-get.service';

import { SelectionUpdateService } from './selection-update.service';
import { SelectionChangedSaga } from './selection-changed.saga';
import { UpdatePlanningUnitsHandler } from './update-planning-units.handler';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Scenario]),
    TypeOrmModule.forFeature([ProtectedArea], DbConnections.geoprocessingDB),
    ProtectionStatusModule.for(DbConnections.geoprocessingDB),
    PlanningAreasModule,
  ],
  providers: [
    SelectionUpdateService,
    UpdatePlanningUnitsHandler,
    SelectionChangedSaga,
    SelectionGetService,
  ],
  exports: [SelectionUpdateService],
})
export class SelectionChangeModule {}
