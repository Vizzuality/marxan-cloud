import {
  DynamicModule,
  Logger,
  Module,
  ModuleMetadata,
  Scope,
} from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../../projects/project.api.entity';
import { AllPiecesReadySaga } from './all-pieces-ready.saga';
import { CompleteExportPieceHandler } from './complete-export-piece.handler';
import { ExportProjectHandler } from './export-project.handler';
import { ExportScenarioHandler } from './export-scenario.handler';
import { FinalizeArchiveHandler } from './finalize-archive.handler';
import { GetArchiveHandler } from './get-archive.handler';

@Module({})
export class ExportApplicationModule {
  static for(adapters: ModuleMetadata['imports']): DynamicModule {
    return {
      module: ExportApplicationModule,
      imports: [
        CqrsModule,
        TypeOrmModule.forFeature([Project]),
        ...(adapters ?? []),
      ],
      providers: [
        // internal event flow
        AllPiecesReadySaga,
        // use cases
        ExportProjectHandler,
        ExportScenarioHandler,
        CompleteExportPieceHandler,
        FinalizeArchiveHandler,
        GetArchiveHandler,
        {
          provide: Logger,
          useClass: Logger,
          scope: Scope.TRANSIENT,
        },
      ],
      exports: [],
    };
  }
}
