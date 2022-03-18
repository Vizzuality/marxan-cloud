import { ConsoleLogger, Module } from '@nestjs/common';
import { WorkerModule } from '../modules/worker';

import { ExportPiecesModule } from './pieces/export-pieces.module';
import { ExportWorker } from './export.worker';
import { ExportProcessor } from './export.processor';
import { PiecesExportersModule } from './pieces-exporters/pieces-exporters.module';

@Module({
  imports: [WorkerModule, ExportPiecesModule, PiecesExportersModule],
  providers: [ExportWorker, ExportProcessor, ConsoleLogger],
})
export class ExportModule {}
