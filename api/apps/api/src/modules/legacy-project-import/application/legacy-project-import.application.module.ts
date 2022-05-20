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
import { ApiEventsModule } from '../../api-events';
import { LegacyProjectImportRepository } from '../domain/legacy-project-import/legacy-project-import.repository';
import { LegacyProjectImportComponentEntity } from '../infra/entities/legacy-project-import-component.api.entity';
import { LegacyProjectImportFileEntity } from '../infra/entities/legacy-project-import-file.api.entity';
import { LegacyProjectImportEntity } from '../infra/entities/legacy-project-import.api.entity';
import { LegacyProjectImportTypeormRepository } from '../infra/legacy-project-import-typeorm.repository';
import { AddFileToLegacyProjectImportHandler } from './add-file-to-legacy-project-import.handler';
import { CompleteLegacyProjectImportPieceHandler } from './complete-legacy-project-import-piece.handler';
import { LegacyProjectImportRequestedSaga } from './legacy-project-import-requested.saga';
import { MarkLegacyProjectImportAsSubmittedHandler } from './mark-legacy-project-as-submitted.handler';
import { MarkLegacyProjectImportAsFailedHandler } from './mark-legacy-project-import-as-failed.handler';
import { MarkLegacyProjectImportPieceAsFailedHandler } from './mark-legacy-project-import-piece-as-failed.handler';
import { StartLegacyProjectImportHandler } from './start-legacy-project-import.handler';

@Module({
  imports: [
    ApiEventsModule,
    CqrsModule,
    TypeOrmModule.forFeature([
      LegacyProjectImportEntity,
      LegacyProjectImportComponentEntity,
      LegacyProjectImportFileEntity,
      Project,
      Scenario,
      Organization,
    ]),
  ],
  providers: [
    {
      provide: LegacyProjectImportRepository,
      useClass: LegacyProjectImportTypeormRepository,
    },
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
    MarkLegacyProjectImportAsFailedHandler,
    MarkLegacyProjectImportPieceAsFailedHandler,
    StartLegacyProjectImportHandler,
    AddFileToLegacyProjectImportHandler,
    CompleteLegacyProjectImportPieceHandler,
    { provide: Logger, useClass: Logger, scope: Scope.TRANSIENT },
  ],
})
export class LegacyProjectImportApplicationModule {}
