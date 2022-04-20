import { ArchiveReaderModule } from '@marxan/cloning/infrastructure/archive-reader.module';
import { Logger, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scenario } from '../../../scenarios/scenario.api.entity';
import { ExportAdaptersModule } from '../../export/adapters/export-adapters.module';
import { ImportAdaptersModule } from '../adapters/import-adapters.module';
import { CompleteImportPieceHandler } from './complete-import-piece.handler';
import { ImportProjectHandler } from './import-project.handler';
import { ImportScenarioHandler } from './import-scenario.handler';

@Module({
  imports: [
    CqrsModule,
    ExportAdaptersModule,
    ImportAdaptersModule,
    ArchiveReaderModule,
    TypeOrmModule.forFeature([Scenario]),
  ],
  providers: [
    ImportProjectHandler,
    ImportScenarioHandler,
    CompleteImportPieceHandler,
    Logger,
  ],
  controllers: [],
  exports: [],
})
export class ImportApplicationModule {}
