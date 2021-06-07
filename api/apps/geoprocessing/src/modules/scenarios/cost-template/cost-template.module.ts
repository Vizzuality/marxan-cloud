import { Module } from '@nestjs/common';
import { ScenarioCostSurfaceModule } from '@marxan/scenario-cost-surface';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { CostTemplateGenerator } from './cost-template-generator';
import { CostTemplateWorkerProcessor } from './cost-template-worker-processor';
import { WorkerModule } from '@marxan-geoprocessing/modules/worker';

@Module({
  imports: [
    ScenarioCostSurfaceModule.for(geoprocessingConnections.apiDB.name),
    WorkerModule,
  ],
  providers: [CostTemplateGenerator, CostTemplateWorkerProcessor],
})
export class CostTemplateModule {}
