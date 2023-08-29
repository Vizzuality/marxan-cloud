import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { WorkerModule } from '@marxan-geoprocessing/modules/worker';
import { ShapefilesModule } from '@marxan/shapefile-converter';
import { CostSurfacePuDataEntity } from '@marxan/cost-surfaces';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { ProjectCostSurfaceWorker } from '@marxan-geoprocessing/modules/cost-surface/application/project-cost-surface.worker';
import { ProjectCostSurfaceProcessor } from '@marxan-geoprocessing/modules/cost-surface/application/project-cost-surface.processor';
import { TypeormProjectCostSurface } from '@marxan-geoprocessing/modules/cost-surface/adapters/project/typeorm-project-cost-surface';
import { AvailableProjectPlanningUnitsRepository } from '@marxan-geoprocessing/modules/cost-surface/adapters/project/available-project-planning-units.repository';
import { GetAvailablePlanningUnits } from '../ports/available-planning-units/get-available-planning-units';
import { PuExtractorPort } from '@marxan-geoprocessing/modules/cost-surface/ports/pu-extractor/pu-extractor.port';
import { PuCostExtractor } from '@marxan-geoprocessing/modules/cost-surface/adapters/pu-cost-extractor';
import { ShapefileConverterPort } from '@marxan-geoprocessing/modules/cost-surface/ports/shapefile-converter/shapefile-converter.port';
import { ShapefileConverter } from '@marxan-geoprocessing/modules/cost-surface/adapters/shapefile-converter';

/**
 * @todo: Use CostSurfancePersistencePort as provider and inject TypeormProjectCostSurface once the old approach is removed.
 *        this is needed to avoid DI container going mad having 2 providers with the same token
 */

@Module({
  imports: [
    WorkerModule,
    ShapefilesModule,
    CqrsModule,
    TypeOrmModule.forFeature([ProjectsPuEntity, CostSurfacePuDataEntity]),
  ],
  providers: [
    ProjectCostSurfaceWorker,
    ProjectCostSurfaceProcessor,
    TypeormProjectCostSurface,
    {
      provide: GetAvailablePlanningUnits,
      useClass: AvailableProjectPlanningUnitsRepository,
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
export class ProjectCostSurfaceModule {}
