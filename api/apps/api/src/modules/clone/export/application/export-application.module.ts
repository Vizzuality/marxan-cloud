import { DynamicModule, Logger, Module, ModuleMetadata } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ExportProjectHandler } from './export-project.handler';
import { CompletePieceHandler } from './complete-piece.handler';
import { FinalizeArchiveHandler } from './finalize-archive.handler';
import { AllPiecesReadySaga } from './all-pieces-ready.saga';
import { GetArchiveHandler } from './get-archive.handler';
import { ExportScenarioHandler } from './export-scenario.handler';

@Module({})
export class ExportApplicationModule {
  static for(adapters: ModuleMetadata['imports']): DynamicModule {
    return {
      module: ExportApplicationModule,
      imports: [CqrsModule, ...(adapters ?? [])],
      providers: [
        // internal event flow
        AllPiecesReadySaga,
        // use cases
        ExportProjectHandler,
        ExportScenarioHandler,
        CompletePieceHandler,
        FinalizeArchiveHandler,
        GetArchiveHandler,
        Logger,
      ],
      exports: [],
    };
  }
}
