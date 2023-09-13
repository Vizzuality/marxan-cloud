import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProjectCostSurfaceInfraModule } from '@marxan-api/modules/cost-surface/infra/project/project-cost-surface-infra.module';
import { ProjectCostSurfaceAdaptersModule } from '@marxan-api/modules/cost-surface/adapters/cost-surface-adapters.module';
import { CreateProjectCostSurfaceHandler } from '@marxan-api/modules/cost-surface/application/project/create-project-cost-surface.handler';

// TODO: Generate SetInitialCostSurfaceHandler for projects
@Module({
  imports: [
    ProjectCostSurfaceInfraModule,
    ProjectCostSurfaceAdaptersModule,
    CqrsModule,
  ],
  providers: [CreateProjectCostSurfaceHandler],
})
export class ProjectCostSurfaceApplicationModule {}
