import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { remoteConnectionName } from './entities/remote-connection-name';
import { ScenariosPlanningUnitGeoEntity } from './entities/scenarios-planning-unit.geo.entity';
import { ScenariosPlanningUnitService } from './scenarios-planning-unit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ScenariosPlanningUnitGeoEntity],
      remoteConnectionName,
    ),
  ],
  providers: [ScenariosPlanningUnitService],
  exports: [ScenariosPlanningUnitService, TypeOrmModule],
})
export class ScenariosPlanningUnitModule {}
