import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DbConnections } from '@marxan-api/ormconfig.connections';
import { PlanningUnitsGeom } from '@marxan-jobs/planning-unit-geometry';
import { ScenarioPuvsprGeoEntity } from '@marxan/scenario-puvspr';
import { ScenarioFeaturesData } from '@marxan/features';
import {
  ScenariosPlanningUnitGeoEntity,
  ScenariosPuCostDataGeo,
} from '@marxan/scenarios-planning-unit';
import { MarxanParametersDefaults } from '@marxan/marxan-input';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';

import { BoundDatService } from './bound.dat.service';
import { PuvsprDatService } from './puvspr.dat.service';
import { SpecDatService } from './spec.dat.service';
import { InputFilesService } from './input-files.service';
import { CostSurfaceViewService } from './cost-surface-view.service';
import { ioSettingsProvider } from './input-params/io-settings';
import { InputParameterFileProvider } from './input-params/input-parameter-file.provider';
import { InputFilesArchiverService } from './input-files-archiver.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Scenario]),
    TypeOrmModule.forFeature(
      [
        PlanningUnitsGeom,
        ScenarioPuvsprGeoEntity,
        ScenarioFeaturesData,
        ScenariosPlanningUnitGeoEntity,
        ScenariosPuCostDataGeo,
      ],
      DbConnections.geoprocessingDB,
    ),
  ],
  providers: [
    MarxanParametersDefaults,
    InputFilesService,
    BoundDatService,
    PuvsprDatService,
    SpecDatService,
    CostSurfaceViewService,
    ioSettingsProvider,
    InputParameterFileProvider,
    InputFilesArchiverService,
  ],
  exports: [InputFilesService, InputFilesArchiverService],
})
export class InputFilesModule {}
