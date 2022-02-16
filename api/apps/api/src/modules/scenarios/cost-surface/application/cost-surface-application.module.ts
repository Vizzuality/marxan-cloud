import { Logger, Module, Scope } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../../projects/project.api.entity';
import { CostSurfaceAdaptersModule } from '../adapters/cost-surface-adapters.module';
import { CostSurfaceInfraModule } from '../infra/cost-surface-infra.module';
import { SetInitialCostSurfaceHandler } from './set-initial-cost-surface.handler';
import { UpdateCostSurfaceHandler } from './update-cost-surface.handler';

@Module({
  imports: [
    CostSurfaceInfraModule,
    CostSurfaceAdaptersModule,
    CqrsModule,
    TypeOrmModule.forFeature([Project]),
  ],
  providers: [
    {
      provide: Logger,
      useClass: Logger,
      scope: Scope.TRANSIENT,
    },
    SetInitialCostSurfaceHandler,
    UpdateCostSurfaceHandler,
  ],
})
export class CostSurfaceApplicationModule {}
