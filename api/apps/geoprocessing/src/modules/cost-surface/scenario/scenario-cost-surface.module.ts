import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { WorkerModule } from '@marxan-geoprocessing/modules/worker';
import { CostSurfacePuDataEntity } from '@marxan/cost-surfaces';
import { ScenarioCostSurfaceWorker } from '@marxan-geoprocessing/modules/cost-surface/application/scenario-cost-surface-worker.service';
import { ScenarioCostSurfaceProcessor } from '@marxan-geoprocessing/modules/cost-surface/application/scenario-cost-surface-processor.service';
import { ScenarioCostSurfacePersistencePort } from '@marxan-geoprocessing/modules/cost-surface/ports/persistence/scenario-cost-surface-persistence.port';
import { TypeormScenarioCostSurface } from '@marxan-geoprocessing/modules/cost-surface/adapters/scenario/typeorm-scenario-cost-surface';
import {
  ScenariosPuCostDataGeo,
  ScenariosPuPaDataGeo,
} from '@marxan/scenarios-planning-unit';

@Module({
  imports: [
    WorkerModule,
    CqrsModule,
    TypeOrmModule.forFeature([
      ScenariosPuCostDataGeo,
      ScenariosPuPaDataGeo,
      CostSurfacePuDataEntity,
    ]),
  ],
  providers: [
    ScenarioCostSurfaceWorker,
    ScenarioCostSurfaceProcessor,
    {
      provide: ScenarioCostSurfacePersistencePort,
      useClass: TypeormScenarioCostSurface,
    },
  ],
})
export class ScenarioCostSurfaceModule {}
