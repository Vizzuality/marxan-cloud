import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CostSurfaceAdaptersModule } from '../adapters/cost-surface-adapters.module';
import { CostSurfaceInfraModule } from '../infra/cost-surface-infra.module';
import { SetInitialCostSurfaceHandler } from './set-initial-cost-surface.handler';
import { UpdateCostSurfaceHandler } from './update-cost-surface.handler';

/**
 * @deprecated
 */
@Module({
  imports: [CostSurfaceInfraModule, CostSurfaceAdaptersModule, CqrsModule],
  providers: [SetInitialCostSurfaceHandler, UpdateCostSurfaceHandler],
})
export class CostSurfaceApplicationModule {}
