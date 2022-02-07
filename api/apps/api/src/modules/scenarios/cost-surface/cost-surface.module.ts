import { Module } from '@nestjs/common';
import { CostSurfaceApplicationModule } from './application/cost-surface-application.module';

@Module({
  imports: [CostSurfaceApplicationModule],
  providers: [],
  exports: [],
})
export class CostSurfaceModule {}
