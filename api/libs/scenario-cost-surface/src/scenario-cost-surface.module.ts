import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostSurfaceFileCache } from './cost-surface-file-cache.api.entity';
import { ScenarioCostSurfaceRepository } from './scenario-cost-surface.repository';

@Module({})
export class ScenarioCostSurfaceModule {
  static for(connectionName?: string): DynamicModule {
    return {
      module: ScenarioCostSurfaceModule,
      imports: [
        TypeOrmModule.forFeature([CostSurfaceFileCache], connectionName),
      ],
      providers: [ScenarioCostSurfaceRepository],
      exports: [ScenarioCostSurfaceRepository],
    };
  }
}
