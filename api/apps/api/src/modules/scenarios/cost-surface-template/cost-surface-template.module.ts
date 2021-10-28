import { Module } from '@nestjs/common';
import { ScenarioCostSurfaceModule } from '@marxan/scenario-cost-surface';
import { apiConnections } from '@marxan-api/ormconfig';
import { QueueModule } from '@marxan-api/modules/queue/queue.module';
import { DbStorage } from './db-storage';
import { Storage } from './storage';
import { Queue } from './queue';
import { BullmqQueue, queueName, queueProvider } from './bullmq-queue';
import { ScenarioCostSurfaceTemplateService } from './scenario-cost-surface-template.service';
import { QueuedCostTemplateService } from './queued-cost-template.service';
import { WaitingCostTemplateService } from './waiting-cost-template.service';
import { CostSurfaceTemplateController } from './cost-surface-template.controller';

@Module({
  imports: [
    QueueModule.register({
      name: queueName,
    }),
    ScenarioCostSurfaceModule.for(apiConnections.default.name),
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
    QueuedCostTemplateService,
    WaitingCostTemplateService,
    {
      provide: ScenarioCostSurfaceTemplateService,
      useExisting: WaitingCostTemplateService,
    },
  ],
  controllers: [CostSurfaceTemplateController],
})
export class CostSurfaceTemplateModule {}
