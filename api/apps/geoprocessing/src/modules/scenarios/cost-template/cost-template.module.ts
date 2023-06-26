import { Module } from '@nestjs/common';
import { ProjectTemplateFileModule } from '@marxan/scenario-cost-surface';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { CostTemplateGenerator } from './cost-template-generator';
import { CostTemplateWorkerProcessor } from './cost-template-worker-processor';
import { WorkerModule } from '@marxan-geoprocessing/modules/worker';
import { CostTemplateDumper } from './cost-template-dumper';
import { Storage } from './storage';

@Module({
  imports: [
    ProjectTemplateFileModule.for(geoprocessingConnections.apiDB.name),
    WorkerModule,
  ],
  providers: [
    CostTemplateGenerator,
    CostTemplateWorkerProcessor,
    CostTemplateDumper,
    Storage,
  ],
})
export class CostTemplateModule {}
