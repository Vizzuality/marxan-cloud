import { Module } from '@nestjs/common';
import { WorkerModule } from '../../worker/worker.module';

import { queueName } from './queue-name';
import { ProjectPaProcessingService } from './project-pa-processing.service';
import { ApiEventsModule } from '../../api-events/api-events.module';

@Module({
  imports: [
    WorkerModule.register({
      name: queueName,
      worker: __dirname + '/project-pa.job.ts',
    }),
    ApiEventsModule,
  ],
  providers: [ProjectPaProcessingService],
})
export class ProjectPaJobModule {}
