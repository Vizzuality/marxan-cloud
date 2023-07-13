import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutputProjectSummariesService } from '@marxan-api/modules/projects/output-project-summaries/output-project-summaries.service';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { OutputProjectSummaryApiEntity } from '@marxan/output-project-summaries';
import { BestSolutionDataService } from '@marxan-api/modules/projects/output-project-summaries/solution-data/best-solution-data.service';
import { SummedSolutionDataService } from '@marxan-api/modules/projects/output-project-summaries/solution-data/summed-solution-data.service';
import { ScenariosOutputResultsApiEntity } from '@marxan/marxan-output';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';

@Module({
  providers: [
    OutputProjectSummariesService,
    BestSolutionDataService,
    SummedSolutionDataService,
  ],
  exports: [OutputProjectSummariesService],
  imports: [
    TypeOrmModule.forFeature([ProjectsPuEntity], DbConnections.geoprocessingDB),
    TypeOrmModule.forFeature([
      Scenario,
      ScenariosOutputResultsApiEntity,
      OutputProjectSummaryApiEntity,
    ]),
  ],
})
export class OutputProjectSummariesModule {}
