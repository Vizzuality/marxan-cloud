import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlanningAreasModule } from '@marxan-api/modules/planning-areas';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';

import { SelectionGetService } from './selection-get.service';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ProtectedArea } from '@marxan/protected-areas';
import { BlmPartialResultEntity } from '@marxan/blm-calibration/blm-partial-results.api.entity';

@Module({
  imports: [
    PlanningAreasModule,
    TypeOrmModule.forFeature([Scenario, BlmPartialResultEntity]),
    TypeOrmModule.forFeature([ProtectedArea], DbConnections.geoprocessingDB),
  ],
  providers: [SelectionGetService],
  exports: [SelectionGetService],
})
export class SelectionGetterModule {}

/**
 *  TypeOrmModule.forFeature(
 [
 ProtectedArea,
 ScenariosPlanningUnitGeoEntity,
 ScenariosPuOutputGeoEntity,
 ],
 DbConnections.geoprocessingDB,
 ),
 */
