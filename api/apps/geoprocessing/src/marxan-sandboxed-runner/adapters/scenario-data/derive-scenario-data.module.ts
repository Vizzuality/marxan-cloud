import { HttpModule, Module } from '@nestjs/common';
import { InputFiles } from '../../ports/input-files';
import { AssetFetcher } from './asset-fetcher';
import { DeriveScenarioFacade } from './derive-scenario.facade';
import { FetchConfig } from './fetch.config';

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: InputFiles,
      useClass: DeriveScenarioFacade,
    },
    AssetFetcher,
    FetchConfig,
  ],
  exports: [InputFiles],
})
export class DeriveScenarioDataModule {}
