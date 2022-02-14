import { Module } from '@nestjs/common';
import { WorkerModule } from '../modules/worker';
import { ImportProcessor } from './import.processor';
import { ImportWorker } from './import.worker';
import { PiecesImportersModule } from './pieces-importers/pieces-importers.module';
import { ImportPiecesModule } from './pieces/import-pieces.module';

@Module({
  imports: [WorkerModule, ImportPiecesModule, PiecesImportersModule],
  providers: [ImportWorker, ImportProcessor],
})
export class ImportModule {}
