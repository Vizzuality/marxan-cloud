import { Organization } from '@marxan-api/modules/organizations/organization.api.entity';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import {
  LegacyProjectImportFilesLocalRepository,
  LegacyProjectImportFilesRepository,
  LegacyProjectImportStoragePath,
} from '@marxan/legacy-project-import';
import { Logger, Module, Scope } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '../../../utils/config.utils';
import { UsersProjectsApiEntity } from '../../access-control/projects-acl/entity/users-projects.api.entity';
import { ApiEventsModule } from '../../api-events';
import { LegacyProjectImportRepositoryModule } from '../infra/legacy-project-import.repository.module';
import { AddFileToLegacyProjectImportHandler } from './add-file-to-legacy-project-import.handler';
import { AllLegacyProjectImportPiecesImportedSaga } from './all-legacy-project-import-pieces-imported.saga';
import { CompleteLegacyProjectImportPieceHandler } from './complete-legacy-project-import-piece.handler';
import { LegacyProjectImportRequestedSaga } from './legacy-project-import-requested.saga';
import { MarkLegacyProjectImportAsSubmittedHandler } from './mark-legacy-project-as-submitted.handler';
import { MarkLegacyProjectImportAsFailedHandler } from './mark-legacy-project-import-as-failed.handler';
import { MarkLegacyProjectImportAsFinishedHandler } from './mark-legacy-project-import-as-finished.handler';
import { MarkLegacyProjectImportPieceAsFailedHandler } from './mark-legacy-project-import-piece-as-failed.handler';
import { RunLegacyProjectImportHandler } from './run-legacy-project-import.handler';
import { StartLegacyProjectImportHandler } from './start-legacy-project-import.handler';

@Module({
  imports: [
    ApiEventsModule,
    CqrsModule,
    TypeOrmModule.forFeature([
      Project,
      Scenario,
      Organization,
      UsersProjectsApiEntity,
    ]),
    LegacyProjectImportRepositoryModule,
  ],
  providers: [
    {
      provide: LegacyProjectImportFilesRepository,
      useClass: LegacyProjectImportFilesLocalRepository,
    },
    {
      provide: LegacyProjectImportStoragePath,
      useFactory: () => {
        const path = AppConfig.get<string>(
          'storage.cloningFileStorage.localPath',
        );

        return path.endsWith('/') ? path.substring(0, path.length - 1) : path;
      },
    },
    LegacyProjectImportRequestedSaga,
    MarkLegacyProjectImportAsSubmittedHandler,
    AllLegacyProjectImportPiecesImportedSaga,
    MarkLegacyProjectImportAsFinishedHandler,
    MarkLegacyProjectImportAsFailedHandler,
    MarkLegacyProjectImportPieceAsFailedHandler,
    StartLegacyProjectImportHandler,
    AddFileToLegacyProjectImportHandler,
    RunLegacyProjectImportHandler,
    CompleteLegacyProjectImportPieceHandler,
    { provide: Logger, useClass: Logger, scope: Scope.TRANSIENT },
  ],
})
export class LegacyProjectImportApplicationModule {}
