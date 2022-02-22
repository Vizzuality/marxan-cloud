import { Module } from '@nestjs/common';
import { BlockGuard } from '@marxan-api/modules/projects/block-guard/block-guard.service';
import { ProjectCheckerModule } from '@marxan-api/modules/projects/project-checker/project-checker.module';
import { ApiEventsModule } from '@marxan-api/modules/api-events';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { PlanningAreasModule } from '@marxan-api/modules/planning-areas';
import { MarxanBlockGuard } from '@marxan-api/modules/projects/block-guard/marxan-block-guard.service';
import { ScenarioCheckerModule } from '@marxan-api/modules/scenarios/scenario-checker/scenario-checker.module';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';

@Module({
  imports: [
    ProjectCheckerModule,
    ScenarioCheckerModule,
    PlanningAreasModule,
    ApiEventsModule,
    TypeOrmModule.forFeature([Project, Scenario]),
  ],
  providers: [
    {
      useClass: MarxanBlockGuard,
      provide: BlockGuard,
    },
  ],
  exports: [BlockGuard],
})
export class BlockGuardModule {}
