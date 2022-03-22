import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { MarxanConfig } from '../marxan-config';

// ports
import { sandboxRunnerToken } from '@marxan-geoprocessing/modules/scenarios/runs/tokens';

// adapters
import { WorkspaceModule } from '../adapters-shared/workspace/workspace.module';

import { MarxanSandboxBlmRunnerService } from './marxan-sandbox-blm-runner.service';
import { AssetFactory } from './asset-factory.service';

import { InputFilesFs } from '../adapters-single/scenario-data/input-files-fs';
import { AssetsModule } from '../adapters-shared';
import { BlmFinalResultsRepository } from './blm-final-results.repository';
import { BlmPartialResultsRepository } from './blm-partial-results.repository';
import { MarxanRunnerFactory } from './marxan-runner.factory';
import { MarxanOutputParserModule } from '../adapters-shared/marxan-output-parser/marxan-output-parser.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlmPartialResultEntity } from './blm-partial-results.geo.entity';
import { MarxanDirectory } from '../adapters-single/marxan-directory.service';
import { BlmBestRunService } from './blm-best-run.service';
import { BlmPuidFromBestRunService } from './blm-output-best-run.service';
import { RemovePreviousCalibrationPartialResultsHandler } from './cleanup/remove-previous-calibration-partial-results.handler';
import { BlmCalibrationStartedSaga } from './cleanup/blm-calibration-started.saga';
import { BlmFinalResultEntity } from '@marxan/blm-calibration';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';

export const blmSandboxRunner = Symbol(`blm sandbox runner`);

@Module({
  imports: [
    WorkspaceModule,
    AssetsModule,
    MarxanOutputParserModule,
    TypeOrmModule.forFeature([
      BlmPartialResultEntity,
      BlmFinalResultEntity,
      ProjectsPuEntity,
    ]),
    CqrsModule,
  ],
  providers: [
    MarxanConfig,
    {
      provide: sandboxRunnerToken,
      useClass: MarxanSandboxBlmRunnerService,
    },
    {
      provide: blmSandboxRunner,
      useClass: MarxanSandboxBlmRunnerService,
    },
    BlmFinalResultsRepository,
    BlmPartialResultsRepository,
    AssetFactory,
    InputFilesFs,
    MarxanRunnerFactory,
    MarxanDirectory,
    BlmBestRunService,
    BlmPuidFromBestRunService,
    BlmCalibrationStartedSaga,
    RemovePreviousCalibrationPartialResultsHandler,
  ],
  exports: [sandboxRunnerToken, blmSandboxRunner],
})
export class BlmRunAdapterModule {}
