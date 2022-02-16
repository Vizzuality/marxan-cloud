import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ImportAdaptersModule } from '../adapters/import-adapters.module';
import { CompleteImportPieceHandler } from './complete-import-piece.handler';
import { ImportArchive } from './import-archive';

@Module({
  imports: [CqrsModule, ImportAdaptersModule],
  providers: [ImportArchive, CompleteImportPieceHandler],
  controllers: [],
  exports: [],
})
export class ImportApplicationModule {}
