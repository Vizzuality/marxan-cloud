import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import {
  WorkerModule,
  WorkerProcessor,
} from '@marxan-geoprocessing/modules/worker';
import { ShapefilesModule } from '@marxan-geoprocessing/modules/shapefiles/shapefiles.module';

import { SurfaceCostProcessor } from './application/surface-cost-processor';
import { SurfaceCostWorker } from './application/surface-cost-worker';

import { CostSurfacePersistencePort } from './ports/persistence/cost-surface-persistence.port';
import { PuExtractorPort } from './ports/pu-extractor/pu-extractor.port';
import { ArePuidsAllowedPort } from './ports/pu-validator/are-puuids-allowed.port';
import { ShapefileConverterPort } from './ports/shapefile-converter/shapefile-converter.port';

import { TypeormCostSurface } from './adapters/typeorm-cost-surface';
import { ShapefileConverter } from './adapters/shapefile-converter';
import { ScenariosPuCostDataGeo } from '../scenarios/scenarios-pu-cost-data.geo.entity';
import { ScenariosPlanningUnitGeoEntity } from '../scenarios/scenarios-planning-unit.geo.entity';
import { PuCostExtractor } from './adapters/pu-cost-extractor';

@Module({
  imports: [
    WorkerModule,
    ShapefilesModule,
    CqrsModule,
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
      useClass: PuCostExtractor,
    },
    {
      provide: ShapefileConverterPort,
      useClass: ShapefileConverter,
    },
  ],
})
export class SurfaceCostModule {}
