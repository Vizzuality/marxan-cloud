import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostSurface } from './cost-surface.api.entity';
import { ProjectAclModule } from '@marxan-api/modules/access-control/projects-acl/project-acl.module';
import { CostSurfaceService } from '@marxan-api/modules/cost-surface/cost-surface.service';
import { CostSurfaceSerializer } from '@marxan-api/modules/cost-surface/dto/cost-surface.serializer';
import { CqrsModule } from '@nestjs/cqrs';
import { DeleteProjectModule } from '@marxan-api/modules/projects/delete-project/delete-project.module';
import { ProjectCostSurfaceApplicationModule } from '@marxan-api/modules/cost-surface/application/project/project-cost-surface-application.module';
import { CostSurfaceApplicationModule } from '@marxan-api/modules/cost-surface/application/cost-surface-application.module';

@Module({
  imports: [
    ProjectCostSurfaceApplicationModule,
    CostSurfaceApplicationModule,
    DeleteProjectModule,
    TypeOrmModule.forFeature([CostSurface]),
    CqrsModule,
    ProjectAclModule,
  ],
  providers: [CostSurfaceService, CostSurfaceSerializer],

  exports: [CostSurfaceService, CostSurfaceSerializer],
})
export class CostSurfaceModule {}
