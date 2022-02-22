import { ApiEventsModule } from '@marxan-api/modules/api-events';
import { PlanningAreasModule } from '@marxan-api/modules/planning-areas';
import { MarxanProjectChecker } from '@marxan-api/modules/projects/project-checker/marxan-project-checker.service';
import { ProjectChecker } from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';
import { ScenarioCheckerModule } from '@marxan-api/modules/scenarios/scenario-checker/scenario-checker.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../project.api.entity';

@Module({
  imports: [
    ApiEventsModule,
    ScenarioCheckerModule,
    PlanningAreasModule,
    TypeOrmModule.forFeature([Project, PublishedProject]),
  ],
  providers: [
    {
      useClass: MarxanProjectChecker,
      provide: ProjectChecker,
    },
  ],
  exports: [ProjectChecker],
})
export class ProjectCheckerModule {}
