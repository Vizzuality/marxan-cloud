import { Module } from '@nestjs/common';
import { ProjectChecker } from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { MarxanProjectChecker } from '@marxan-api/modules/projects/project-checker/marxan-project-checker.service';
import { ApiEventsModule } from '@marxan-api/modules/api-events';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../project.api.entity';
import { PlanningAreasModule } from '@marxan-api/modules/planning-areas';

@Module({
  imports: [
    ApiEventsModule,
    PlanningAreasModule,
    TypeOrmModule.forFeature([Project]),
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
