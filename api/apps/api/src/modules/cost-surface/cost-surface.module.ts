import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostSurface } from './cost-surface.api.entity';
import { CostSurfaceApplicationModule } from '@marxan-api/modules/cost-surface/application/cost-surface-application.module';
import { ProjectAclModule } from '@marxan-api/modules/access-control/projects-acl/project-acl.module';
import { CostSurfaceService } from '@marxan-api/modules/cost-surface/cost-surface.service';
import { CostSurfaceSerializer } from '@marxan-api/modules/cost-surface/dto/cost-surface.serializer';

@Module({
  providers: [CostSurfaceService, CostSurfaceSerializer],
  imports: [
    CostSurfaceApplicationModule,
    TypeOrmModule.forFeature([CostSurface]),
    ProjectAclModule,
  ],
  exports: [CostSurfaceService, CostSurfaceSerializer],
})
export class CostSurfaceModule {}
