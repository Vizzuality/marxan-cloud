import { Module } from '@nestjs/common';
import { ArtifactCacheModule } from '@marxan/artifact-cache';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ProjectTemplateGenerator } from './project-template-generator';
import { ProjectTemplateWorkerProcessor } from './project-template-worker-processor';
import { WorkerModule } from '@marxan-geoprocessing/modules/worker';
import { FileTemplateDumper } from './file-template-dumper';
import { Storage } from './storage';

@Module({
  imports: [
    ArtifactCacheModule.for(geoprocessingConnections.apiDB.name),
    WorkerModule,
  ],
  providers: [
    ProjectTemplateGenerator,
    ProjectTemplateWorkerProcessor,
    FileTemplateDumper,
    Storage,
  ],
})
export class FileTemplateModule {}
