import { Module } from '@nestjs/common';
import { WorkerModule } from '../worker';

import { SurfaceCostProcessor } from './application/surface-cost-processor';
import { SurfaceCostWorker } from './application/surface-cost-worker';

import { CostSurfacePersistencePort } from './ports/persistence/cost-surface-persistence.port';
import { PuExtractorPort } from './ports/pu-extractor/pu-extractor.port';
import { ArePuidsAllowedPort } from './ports/pu-validator/are-puuids-allowed.port';
import { ShapefileConverterPort } from './ports/shapefile-converter/shapefile-converter.port';

@Module({
  imports: [WorkerModule],
  providers: [
    SurfaceCostWorker,
    SurfaceCostProcessor,
    {
      provide: CostSurfacePersistencePort,
      useValue: {},
    },
    {
      provide: ArePuidsAllowedPort,
      useValue: {},
    },
    {
      provide: PuExtractorPort,
      useValue: {},
    },
    {
      provide: ShapefileConverterPort,
      useValue: {},
    },
  ],
})
export class SurfaceCostModule {}
