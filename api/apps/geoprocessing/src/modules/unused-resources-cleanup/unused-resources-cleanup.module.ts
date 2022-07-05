import { Module } from '@nestjs/common';
import { WorkerModule } from '../worker';
import { DeleteUnusedResourcesModule } from './delete-unused-resources/delete-unused-resources.module';
import { UnusedResourcesCleanupProcessor } from './unused-resources-cleanup.processor';
import { UnusedResourcesCleanupWorker } from './unused-resources-cleanup.worker';

@Module({
  imports: [WorkerModule, DeleteUnusedResourcesModule],
  providers: [UnusedResourcesCleanupWorker, UnusedResourcesCleanupProcessor],
})
export class UnusedResourcesCleanUpModule {}
