import { Module } from '@nestjs/common';
import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';
import { QueueModule } from '@marxan-api/modules/queue';
import { AdapterFactory } from './adapter.factory';

const queueModule = QueueModule.register();
@Module({
  imports: [ApiEventsModule, queueModule],
  providers: [AdapterFactory],
  exports: [AdapterFactory, queueModule],
})
export class QueueApiEventsModule {}
