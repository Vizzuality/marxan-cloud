import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersProjectsApiEntity } from '../../../access-control/projects-acl/entity/users-projects.api.entity';
import { Project } from '../../../projects/project.api.entity';
import { Scenario } from '../../../scenarios/scenario.api.entity';
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
        TypeOrmModule.forFeature([Project, Scenario, UsersProjectsApiEntity]),
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
      ],
      exports: [],
    };
  }
}
