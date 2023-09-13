import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostSurface } from './cost-surface.api.entity';
import { ProjectAclModule } from '@marxan-api/modules/access-control/projects-acl/project-acl.module';
import { CostSurfaceService } from '@marxan-api/modules/cost-surface/cost-surface.service';
import { CostSurfaceSerializer } from '@marxan-api/modules/cost-surface/dto/cost-surface.serializer';
import { DeleteProjectModule } from '@marxan-api/modules/projects/delete-project/delete-project.module';
import { ProjectCostSurfaceApplicationModule } from '@marxan-api/modules/cost-surface/application/project/project-cost-surface-application.module';
import { CostSurfaceApplicationModule } from '@marxan-api/modules/cost-surface/application/cost-surface-application.module';
import { ProjectCostSurfaceAdaptersModule } from '@marxan-api/modules/cost-surface/adapters/cost-surface-adapters.module';
import { CostRangeService } from '@marxan-api/modules/scenarios/cost-range-service';

@Module({
  imports: [
    ProjectCostSurfaceApplicationModule,
    ProjectCostSurfaceAdaptersModule,
    CostSurfaceApplicationModule,
    DeleteProjectModule,
    TypeOrmModule.forFeature([CostSurface]),
    ProjectAclModule,
  ],
  providers: [CostSurfaceService, CostSurfaceSerializer, CostRangeService],

  exports: [CostSurfaceService, CostSurfaceSerializer, CostRangeService],
})
export class CostSurfaceModule {}
