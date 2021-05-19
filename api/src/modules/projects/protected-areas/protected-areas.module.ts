import { Logger, Module } from '@nestjs/common';
import { ProtectedAreasFacade } from './protected-areas.facade';
import { QueueModule } from '../../queue/queue.module';
import { queueName } from './queue-name';

@Module({
  imports: [
    QueueModule.register({
      name: queueName,
    }),
  ],
  providers: [Logger, ProtectedAreasFacade],
  exports: [ProtectedAreasFacade],
})
export class ProtectedAreasModule {}
