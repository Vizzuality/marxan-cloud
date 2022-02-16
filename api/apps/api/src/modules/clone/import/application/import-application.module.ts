import { Logger, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ImportAdaptersModule } from '../adapters/import-adapters.module';
import { CompleteImportPieceHandler } from './complete-import-piece.handler';
import { ImportArchiveHandler } from './import-archive.handler';

@Module({
  imports: [CqrsModule, ImportAdaptersModule],
  providers: [ImportArchiveHandler, CompleteImportPieceHandler, Logger],
  controllers: [],
  exports: [],
})
export class ImportApplicationModule {}
