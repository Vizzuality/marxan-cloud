import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DbConnections } from '@marxan-api/ormconfig.connections';
import { PlanningUnitsGeom } from '@marxan-jobs/planning-unit-geometry';
import { ScenarioPuvsprGeoEntity } from '@marxan/scenario-puvspr';
import { RemoteScenarioFeaturesData } from '@marxan-api/modules/scenarios-features/entities/remote-scenario-features-data.geo.entity';
import {
  ScenariosPlanningUnitGeoEntity,
  ScenariosPuCostDataGeo,
} from '@marxan/scenarios-planning-unit';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';

import { BoundDatService } from './bound.dat.service';
import { PuvsprDatService } from './puvspr.dat.service';
import { SpecDatService } from './spec.dat.service';
import { InputFilesService } from './input-files.service';
import { CostSurfaceViewService } from './cost-surface-view.service';
import { ioSettingsProvider } from './input-params/io-settings';
import { InputParameterFileProvider } from './input-params/input-parameter-file.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([Scenario]),
    TypeOrmModule.forFeature(
      [
        PlanningUnitsGeom,
        ScenarioPuvsprGeoEntity,
        RemoteScenarioFeaturesData,
        ScenariosPlanningUnitGeoEntity,
        ScenariosPuCostDataGeo,
      ],
      DbConnections.geoprocessingDB,
    ),
  ],
  providers: [
    InputFilesService,
    BoundDatService,
    PuvsprDatService,
    SpecDatService,
    CostSurfaceViewService,
    ioSettingsProvider,
    InputParameterFileProvider,
  ],
  exports: [InputFilesService],
})
export class InputFilesModule {}
