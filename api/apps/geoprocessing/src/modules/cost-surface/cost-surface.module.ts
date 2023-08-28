import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { CqrsModule } from '@nestjs/cqrs';
import { WorkerModule } from '@marxan-geoprocessing/modules/worker';
import { ShapefilesModule } from '@marxan/shapefile-converter';

import { CostSurfaceProcessor } from './application/cost-surface-processor.service';
import { CostSurfaceWorker } from './application/cost-surface-worker.service';

import { CostSurfacePersistencePort } from './ports/persistence/cost-surface-persistence.port';
import { PuExtractorPort } from './ports/pu-extractor/pu-extractor.port';
import { GetAvailablePlanningUnits } from './ports/available-planning-units/get-available-planning-units';
import { ShapefileConverterPort } from './ports/shapefile-converter/shapefile-converter.port';

import { TypeormCostSurface } from './adapters/typeorm-cost-surface';
import { ShapefileConverter } from './adapters/shapefile-converter';
import { PuCostExtractor } from './adapters/pu-cost-extractor';
import { AvailablePlanningUnitsRepository } from './adapters/available-planning-units-repository';
import { ScenariosPuCostDataGeo } from '@marxan/scenarios-planning-unit';
import { CostSurfacePuDataGeoEntity } from '@marxan/cost-surfaces';

@Module({
  imports: [
    WorkerModule,
    ShapefilesModule,
    CqrsModule,
    TypeOrmModule.forFeature([
      ScenariosPuCostDataGeo,
      ScenariosPuPaDataGeo,
      CostSurfacePuDataGeoEntity,
    ]),
  ],
  providers: [
    CostSurfaceWorker,
    CostSurfaceProcessor,
    {
      provide: CostSurfacePersistencePort,
      useClass: TypeormCostSurface,
    },
    {
      provide: GetAvailablePlanningUnits,
      useClass: AvailablePlanningUnitsRepository,
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
export class CostSurfaceModule {}
