import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScenariosOutputResultsApiEntity } from '@marxan/scenarios-planning-unit';
import { MarxanConfig } from './marxan-config';
import { MarxanSandboxRunnerService } from './marxan-sandbox-runner.service';

import { WorkspaceModule } from './adapters/workspace/workspace.module';
import { MarxanDirectory } from './adapters/marxan-directory.service';
import { MarxanExecutionMetadataModule } from './adapters/solutions-output/metadata/marxan-execution-metadata.module';
import { FileReader } from './adapters/file-reader';
import { AssetFetcher } from './adapters/scenario-data/asset-fetcher';
import { FetchConfig } from './adapters/scenario-data/fetch.config';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

@Module({
  imports: [
    HttpModule,
    WorkspaceModule,
    TypeOrmModule.forFeature(
      [ScenariosOutputResultsApiEntity],
      geoprocessingConnections.apiDB,
    ),
    MarxanExecutionMetadataModule,
  ],
  providers: [
    MarxanConfig,
    MarxanSandboxRunnerService,
    AssetFetcher,
    FetchConfig,
    MarxanDirectory,
    FileReader,
  ],
  exports: [MarxanSandboxRunnerService],
})
export class MarxanSandboxedRunnerModule {}
