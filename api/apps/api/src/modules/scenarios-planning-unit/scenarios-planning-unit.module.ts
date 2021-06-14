import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ScenariosPlanningUnitService } from './scenarios-planning-unit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ScenariosPlanningUnitGeoEntity],
      DbConnections.geoprocessingDB,
    ),
  ],
  providers: [ScenariosPlanningUnitService],
  exports: [ScenariosPlanningUnitService, TypeOrmModule],
})
export class ScenariosPlanningUnitModule {}
