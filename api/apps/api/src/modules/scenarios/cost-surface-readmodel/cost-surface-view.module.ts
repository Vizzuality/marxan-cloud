import { Module } from '@nestjs/common';
import { CostSurfaceViewService } from './cost-surface-view.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanningUnitsGeom } from '@marxan-jobs/planning-unit-geometry';
import {
  ScenariosPlanningUnitGeoEntity,
  ScenariosPuCostDataGeo,
} from '@marxan/scenarios-planning-unit';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        PlanningUnitsGeom,
        ScenariosPlanningUnitGeoEntity,
        ScenariosPuCostDataGeo,
      ],
      DbConnections.geoprocessingDB,
    ),
  ],
  providers: [CostSurfaceViewService],
  exports: [CostSurfaceViewService],
})
export class CostSurfaceViewModule {}
