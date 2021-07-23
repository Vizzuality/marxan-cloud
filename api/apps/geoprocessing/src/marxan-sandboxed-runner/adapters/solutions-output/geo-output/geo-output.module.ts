import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';

import { GeoOutputRepository } from './geo-output.repository';
import { MetadataArchiver } from './metadata/data-archiver.service';
import { MarxanDirectory } from '../../marxan-directory.service';
import { FileReader } from '../../file-reader';
import { SolutionsReaderService } from './solutions/output-file-parsing/solutions-reader.service';
import { PlanningUnitSelectionCalculatorService } from './solutions/solution-aggregation/planning-unit-selection-calculator.service';
import { ScenarioFeaturesDataService } from './scenario-features/scenario-features-data.service';
import { OutputScenariosPuDataGeoEntity } from '@marxan/marxan-output';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { ScenarioFeaturesData } from '@marxan/features';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MarxanExecutionMetadataGeoEntity,
      OutputScenariosPuDataGeoEntity,
      ScenariosPlanningUnitGeoEntity,
      ScenarioFeaturesData,
    ]),
  ],
  providers: [
    GeoOutputRepository,
    MetadataArchiver,
    MarxanDirectory,
    FileReader,
    SolutionsReaderService,
    ScenarioFeaturesDataService,
    PlanningUnitSelectionCalculatorService,
  ],
  exports: [GeoOutputRepository],
})
export class GeoOutputModule {}
