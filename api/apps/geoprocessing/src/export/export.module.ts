import { Module } from '@nestjs/common';
import { WorkerModule } from '@marxan-geoprocessing/modules/worker';

import { ExportPiecesModule } from './pieces/export-pieces.module';
import { ExportWorker } from './export.worker';
import { ExportProcessor } from './export.processor';
import { PiecesExportersModule } from './pieces-exporters/pieces-exporters.module';

@Module({
  imports: [WorkerModule, ExportPiecesModule, PiecesExportersModule],
  providers: [ExportWorker, ExportProcessor],
})
export class ExportModule {}
