import { Module } from '@nestjs/common';
import { EditGuard } from '@marxan-api/modules/projects/edit-guard/edit-guard.service';
import { ProjectCheckerModule } from '@marxan-api/modules/projects/project-checker/project-checker.module';
import { ApiEventsModule } from '@marxan-api/modules/api-events';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { PlanningAreasModule } from '@marxan-api/modules/planning-areas';
import { MarxanEditGuard } from '@marxan-api/modules/projects/edit-guard/marxan-edit-guard.service';

@Module({
  imports: [
    ProjectCheckerModule,
    PlanningAreasModule,
    ApiEventsModule,
    TypeOrmModule.forFeature([Project]),
  ],
  providers: [
    {
      useClass: MarxanEditGuard,
      provide: EditGuard,
    },
  ],
  exports: [EditGuard],
})
export class EditGuardModule {}
