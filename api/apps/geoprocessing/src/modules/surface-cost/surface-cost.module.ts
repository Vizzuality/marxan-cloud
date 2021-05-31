import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { WorkerModule, WorkerProcessor } from '../worker';

import { SurfaceCostProcessor } from './application/surface-cost-processor';
import { SurfaceCostWorker } from './application/surface-cost-worker';

import { CostSurfacePersistencePort } from './ports/persistence/cost-surface-persistence.port';
import { PuExtractorPort } from './ports/pu-extractor/pu-extractor.port';
import { GetAvailablePlanningUnits } from './ports/available-planning-units/get-available-planning-units';
import { ShapefileConverterPort } from './ports/shapefile-converter/shapefile-converter.port';

import { TypeormCostSurface } from './adapters/typeorm-cost-surface';
import { ScenariosPuCostDataGeo } from '../scenarios/scenarios-pu-cost-data.geo.entity';
import { TypeormAvailablePlanningUnits } from './adapters/typeorm-available-planning-units';

@Module({
  imports: [
    WorkerModule,
    TypeOrmModule.forFeature([
      ScenariosPuCostDataGeo,
      ScenariosPlanningUnitGeoEntity,
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
      provide: GetAvailablePlanningUnits,
      useClass: TypeormAvailablePlanningUnits,
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
