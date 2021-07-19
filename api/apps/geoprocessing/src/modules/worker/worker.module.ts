import { Module } from '@nestjs/common';
import { Config } from './config';
import { WorkerBuilder } from './worker-builder';
import { QueueEventsBuilder } from './queue-events.builder';

@Module({
  providers: [WorkerBuilder, Config, QueueEventsBuilder],
  exports: [WorkerBuilder, QueueEventsBuilder],
})
export class WorkerModule {}
