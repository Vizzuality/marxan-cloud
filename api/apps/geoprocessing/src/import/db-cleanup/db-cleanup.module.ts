import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerModule } from '../../modules/worker';
import { geoprocessingConnections } from '../../ormconfig';
import { DbCleanupProcessor } from './db-cleanup.processor';
import { DbCleanupWorker } from './db-cleanup.worker';

@Module({
  imports: [
    WorkerModule,
    TypeOrmModule.forFeature([], geoprocessingConnections.apiDB),
    TypeOrmModule.forFeature([], geoprocessingConnections.default),
  ],
  providers: [DbCleanupProcessor, DbCleanupWorker],
})
export class DbCleanupModule {}
