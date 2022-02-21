import { ArchiveReaderModule } from '@marxan/cloning/infrastructure/archive-reader.module';
import { Logger, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ImportAdaptersModule } from '../adapters/import-adapters.module';
import { CompleteImportPieceHandler } from './complete-import-piece.handler';
import { ExportConfigReader } from './export-config-reader';
import { ImportProjectHandler } from './import-project.handler';

@Module({
  imports: [CqrsModule, ImportAdaptersModule, ArchiveReaderModule],
  providers: [
    ImportProjectHandler,
    CompleteImportPieceHandler,
    ExportConfigReader,
    Logger,
  ],
  controllers: [],
  exports: [],
})
export class ImportApplicationModule {}
