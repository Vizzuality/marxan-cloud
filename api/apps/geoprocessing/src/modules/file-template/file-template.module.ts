import { Module } from '@nestjs/common';
import { ProjectTemplateFileModule } from '@marxan/project-template-file';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ProjectTemplateGenerator } from './project-template-generator';
import { ProjectTemplateWorkerProcessor } from './project-template-worker-processor';
import { WorkerModule } from '@marxan-geoprocessing/modules/worker';
import { FileTemplateDumper } from './file-template-dumper';
import { Storage } from './storage';

@Module({
  imports: [
    ProjectTemplateFileModule.for(geoprocessingConnections.apiDB.name),
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
