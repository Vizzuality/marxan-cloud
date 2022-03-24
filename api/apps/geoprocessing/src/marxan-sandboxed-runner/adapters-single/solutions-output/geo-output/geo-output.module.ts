import {
  MarxanExecutionMetadataGeoEntity,
  OutputScenariosFeaturesDataGeoEntity,
  OutputScenariosPuDataGeoEntity,
} from '@marxan/marxan-output';
import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileReader } from '../../file-reader';
import { MarxanDirectory } from '../../marxan-directory.service';
import { GeoOutputRepository } from './geo-output.repository';
import { MetadataArchiver } from './metadata/data-archiver.service';
import { ScenarioFeaturesModule } from './scenario-features';
import { SolutionsReaderService } from './solutions/output-file-parsing/solutions-reader.service';
import { PlanningUnitSelectionCalculatorService } from './solutions/solution-aggregation/planning-unit-selection-calculator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MarxanExecutionMetadataGeoEntity,
      OutputScenariosPuDataGeoEntity,
      ScenariosPuPaDataGeo,
      OutputScenariosFeaturesDataGeoEntity,
    ]),
    ScenarioFeaturesModule,
  ],
  providers: [
    Logger,
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
