import { Module } from '@nestjs/common';
import { WorkerModule } from '../worker';
import { UnusedResourcesCleanupProcessor } from './unused-resources-cleanup.processor';
import { UnusedResourcesCleanupWorker } from './unused-resources-cleanup.worker';

@Module({
  imports: [WorkerModule],
  providers: [UnusedResourcesCleanupWorker, UnusedResourcesCleanupProcessor],
})
export class UnusedResourcesCleanUpModule {}
