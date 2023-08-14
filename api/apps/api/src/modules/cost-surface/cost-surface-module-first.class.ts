import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostSurface } from './cost-surface.api.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CostSurface])],
})
export class CostSurfaceModuleFirstClass {}
