import { Module } from '@nestjs/common';
import { WorkerModule } from '../modules/worker';
import { LegacyProjectImportProcessor } from './legacy-project-import.processor';
import { LegacyProjectImportWorker } from './legacy-project-import.worker';
import { LegacyPieceImportersModule } from './legacy-piece-importers/legacy-piece-importers.module';
import { LegacyProjectImportPiecesModule } from './pieces/legacy-project-import-pieces.module';
import { LegacyDbCleanupModule } from './legacy-db-cleanup/legacy-db-cleanup.module';

@Module({
  imports: [
    WorkerModule,
    LegacyProjectImportPiecesModule,
    LegacyPieceImportersModule,
    LegacyDbCleanupModule,
  ],
  providers: [LegacyProjectImportWorker, LegacyProjectImportProcessor],
})
export class LegacyProjectImportModule {}
