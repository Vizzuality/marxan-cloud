import { Module } from '@nestjs/common';
import { ArtifactCacheModule } from '@marxan/artifact-cache';
import { apiConnections } from '@marxan-api/ormconfig';
import { QueueModule } from '@marxan-api/modules/queue/queue.module';
import { DbStorage } from './db-storage';
import { Storage } from './storage';
import { Queue } from './queue';
import { BullmqQueue, queueName, queueProvider } from './bullmq-queue';
import { ProjectTemplateService } from './project-template.service';
import { QueuedProjectTemplateService } from '@marxan-api/modules/projects/shapefile-template/queued-project-template.service';
import { WaitingProjectTemplateService } from '@marxan-api/modules/projects/shapefile-template/waiting-project-template.service';
import { ProjectTemplateController } from '@marxan-api/modules/projects/shapefile-template/project-template.controller';
@Module({
  imports: [
    QueueModule.register({
      name: queueName,
    }),
    ArtifactCacheModule.for(apiConnections.default.name),
  ],
  providers: [
    {
      provide: Storage,
      useClass: DbStorage,
    },
    {
      provide: Queue,
      useClass: BullmqQueue,
    },
    queueProvider,
    QueuedProjectTemplateService,
    WaitingProjectTemplateService,
    {
      provide: ProjectTemplateService,
      useExisting: WaitingProjectTemplateService,
    },
  ],
  controllers: [ProjectTemplateController],
})
export class ProjectTemplateModule {}
