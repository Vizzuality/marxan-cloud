import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostSurface } from './cost-surface.api.entity';
import { CostSurfaceApplicationModule } from '@marxan-api/modules/cost-surface/application/cost-surface-application.module';

@Module({
  imports: [
    CostSurfaceApplicationModule,
    TypeOrmModule.forFeature([CostSurface]),
  ],
})
export class CostSurfaceModule {}
