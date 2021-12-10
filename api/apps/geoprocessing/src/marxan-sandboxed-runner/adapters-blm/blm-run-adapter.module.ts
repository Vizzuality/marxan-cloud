import { Module } from '@nestjs/common';

import { MarxanConfig } from '../marxan-config';

// ports
import { sandboxRunnerToken } from '@marxan-geoprocessing/modules/scenarios/runs/tokens';

// adapters
import { WorkspaceModule } from '../adapters-shared/workspace/workspace.module';

import { MarxanSandboxBlmRunnerService } from './marxan-sandbox-blm-runner.service';
import { BlmInputFiles } from './blm-input-files';
import { AssetFactory } from './asset-factory.service';

import { InputFilesFs } from '../adapters-single/scenario-data/input-files-fs';
import { AssetsModule } from '../adapters-shared';
import { GeoOutputModule } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/solutions-output/geo-output';
import { ResultParserService } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/solutions-output/result-parser.service';
import { MostDifferentService } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/solutions-output/most-different.service';
import { BestSolutionService } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/solutions-output/best-solution.service';
import { MarxanDirectory } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/marxan-directory.service';
import { BlmPartialResultsTypeOrmRepository } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-blm/blm-partial-results.typeorm-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlmPartialResultEntity } from '@marxan/blm-calibration/blm-partial-results.geo.entity';
import { BlmPartialResultsRepository } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-blm/blm-partial-results.repository';

export const blmSandboxRunner = Symbol(`blm sandbox runner`);

@Module({
  imports: [
    WorkspaceModule,
    AssetsModule,
    GeoOutputModule,
    TypeOrmModule.forFeature([BlmPartialResultEntity]),
  ],
  providers: [
    ResultParserService,
    MostDifferentService,
    BestSolutionService,
    MarxanConfig,
    MarxanDirectory,
    {
      provide: sandboxRunnerToken,
      useClass: MarxanSandboxBlmRunnerService,
    },
    {
      provide: blmSandboxRunner,
      useClass: MarxanSandboxBlmRunnerService,
    },
    {
      provide: BlmPartialResultsRepository,
      useClass: BlmPartialResultsTypeOrmRepository,
    },
    AssetFactory,
    BlmInputFiles,
    InputFilesFs,
  ],
  exports: [sandboxRunnerToken, blmSandboxRunner],
})
export class BlmRunAdapterModule {}
