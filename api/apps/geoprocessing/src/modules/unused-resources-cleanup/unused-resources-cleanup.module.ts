import { Module } from '@nestjs/common';
import { WorkerModule } from '../worker';
import { UnusedResourcesModule } from './delete-unused-resources/unused-resources.module';
import { UnusedResourcesCleanupProcessor } from './unused-resources-cleanup.processor';
import { UnusedResourcesCleanupWorker } from './unused-resources-cleanup.worker';

@Module({
  imports: [WorkerModule, UnusedResourcesModule],
  providers: [UnusedResourcesCleanupWorker, UnusedResourcesCleanupProcessor],
  exports: [UnusedResourcesModule],
})
export class UnusedResourcesCleanUpModule {}
