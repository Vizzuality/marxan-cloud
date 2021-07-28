import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MarxanExecutionMetadataGeoEntity,
  OutputScenariosFeaturesDataGeoEntity,
  OutputScenariosPuDataGeoEntity,
} from '@marxan/marxan-output';

import { GeoOutputRepository } from './geo-output.repository';
import { MetadataArchiver } from './metadata/data-archiver.service';
import { MarxanDirectory } from '../../marxan-directory.service';
import { FileReader } from '../../file-reader';
import { SolutionsReaderService } from './solutions/output-file-parsing/solutions-reader.service';
import { PlanningUnitSelectionCalculatorService } from './solutions/solution-aggregation/planning-unit-selection-calculator.service';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';

import { ScenarioFeaturesModule } from './scenario-features';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MarxanExecutionMetadataGeoEntity,
      OutputScenariosPuDataGeoEntity,
      ScenariosPlanningUnitGeoEntity,
      OutputScenariosFeaturesDataGeoEntity,
    ]),
    ScenarioFeaturesModule,
  ],
  providers: [
    GeoOutputRepository,
    MetadataArchiver,
    MarxanDirectory,
    FileReader,
    SolutionsReaderService,
    PlanningUnitSelectionCalculatorService,
  ],
  exports: [GeoOutputRepository],
})
export class GeoOutputModule {}
