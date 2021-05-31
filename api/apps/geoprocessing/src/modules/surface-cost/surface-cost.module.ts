import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerModule, WorkerProcessor } from '../worker';

import { SurfaceCostProcessor } from './application/surface-cost-processor';
import { SurfaceCostWorker } from './application/surface-cost-worker';

import { CostSurfacePersistencePort } from './ports/persistence/cost-surface-persistence.port';
import { PuExtractorPort } from './ports/pu-extractor/pu-extractor.port';
import { ArePuidsAllowedPort } from './ports/pu-validator/are-puuids-allowed.port';
import { ShapefileConverterPort } from './ports/shapefile-converter/shapefile-converter.port';

import { TypeormCostSurface } from './adapters/typeorm-cost-surface';
import { ScenariosPuCostDataGeo } from '../scenarios/scenarios-pu-cost-data.geo.entity';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';

@Module({
  imports: [
    WorkerModule,
    TypeOrmModule.forFeature([
      ScenariosPuCostDataGeo,
      ScenariosPlanningUnitGeoEntity, // not used but has to imported somewhere
    ]),
  ],
  providers: [
    SurfaceCostWorker,
    {
      provide: WorkerProcessor,
      useClass: SurfaceCostProcessor,
    },
    {
      provide: CostSurfacePersistencePort,
      useClass: TypeormCostSurface,
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
