import { Module } from '@nestjs/common';
import { Config } from './config';
import { WorkerResolver } from './worker-resolver';

@Module({
  providers: [WorkerResolver, Config],
  exports: [WorkerResolver],
})
export class WorkerModule {}
