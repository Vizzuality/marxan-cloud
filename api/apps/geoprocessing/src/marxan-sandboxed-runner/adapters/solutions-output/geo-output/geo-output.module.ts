import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';

import { GeoOutputRepository } from './geo-output.repository';
import { MetadataArchiver } from './metadata/data-archiver.service';
import { MarxanDirectory } from '../../marxan-directory.service';
import { FileReader } from '../../file-reader';
import { SolutionsReaderService } from './solutions/output-file-parsing/solutions-reader.service';
import { PlanningUnitStateCalculatorService } from './solutions/solution-aggregation/planning-unit-state-calculator.service';
import { OutputScenariosPuDataGeoEntity } from '@marxan/marxan-output';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MarxanExecutionMetadataGeoEntity,
      OutputScenariosPuDataGeoEntity,
      ScenariosPlanningUnitGeoEntity,
    ]),
  ],
  providers: [
    GeoOutputRepository,
    MetadataArchiver,
    MarxanDirectory,
    FileReader,
    SolutionsReaderService,
    PlanningUnitStateCalculatorService,
  ],
  exports: [GeoOutputRepository],
})
export class GeoOutputModule {}
