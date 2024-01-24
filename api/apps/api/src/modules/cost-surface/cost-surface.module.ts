import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostSurface } from './cost-surface.api.entity';
import { ProjectAclModule } from '@marxan-api/modules/access-control/projects-acl/project-acl.module';
import { CostSurfaceService } from '@marxan-api/modules/cost-surface/cost-surface.service';
import { CostSurfaceSerializer } from '@marxan-api/modules/cost-surface/dto/cost-surface.serializer';
import { DeleteProjectModule } from '@marxan-api/modules/projects/delete-project/delete-project.module';
import { ProjectCostSurfaceApplicationModule } from '@marxan-api/modules/cost-surface/application/project/project-cost-surface-application.module';
import { DeleteCostSurfaceModule } from '@marxan-api/modules/cost-surface/delete-cost-surface/delete-cost-surface.module';
import { ProjectCostSurfaceAdaptersModule } from '@marxan-api/modules/cost-surface/adapters/cost-surface-adapters.module';
import { CostRangeService } from '@marxan-api/modules/scenarios/cost-range-service';
import { CqrsModule } from '@nestjs/cqrs';
import { ScenarioAclModule } from '@marxan-api/modules/access-control/scenarios-acl/scenario-acl.module';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ScenarioCostSurfaceApplicationModule } from '@marxan-api/modules/cost-surface/application/scenario/scenario-cost-surface-application.module';
import { ScenarioCostSurfaceAdaptersModule } from '@marxan-api/modules/cost-surface/adapters/scenario-cost-surface-adapters.module';

@Module({
  imports: [
    ProjectCostSurfaceApplicationModule,
    ProjectCostSurfaceAdaptersModule,
    ScenarioCostSurfaceApplicationModule,
    ScenarioCostSurfaceAdaptersModule,
    DeleteProjectModule,
    TypeOrmModule.forFeature([CostSurface, Scenario]),
    ProjectAclModule,
    ScenarioAclModule,
    DeleteCostSurfaceModule,
    CqrsModule,
  ],
  providers: [CostSurfaceService, CostSurfaceSerializer, CostRangeService],

  exports: [CostSurfaceService, CostSurfaceSerializer, CostRangeService],
})
export class CostSurfaceModule {}
