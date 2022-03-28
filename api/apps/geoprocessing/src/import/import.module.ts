import { Module } from '@nestjs/common';
import { WorkerModule } from '../modules/worker';
import { DbCleanupModule } from './db-cleanup/db-cleanup.module';
import { ImportProcessor } from './import.processor';
import { ImportWorker } from './import.worker';
import { PiecesImportersModule } from './pieces-importers/pieces-importers.module';
import { ImportPiecesModule } from './pieces/import-pieces.module';

@Module({
  imports: [
    WorkerModule,
    ImportPiecesModule,
    PiecesImportersModule,
    DbCleanupModule,
  ],
  providers: [ImportWorker, ImportProcessor],
})
export class ImportModule {}
