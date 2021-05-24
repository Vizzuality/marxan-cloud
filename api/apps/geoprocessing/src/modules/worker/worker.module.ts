import { Module } from '@nestjs/common';
import { Config } from './config';
import { WorkerBuilder } from './worker-builder';

@Module({
  providers: [WorkerBuilder, Config],
  exports: [WorkerBuilder],
})
export class WorkerModule {}
