import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FetchConfig } from './fetch.config';
import { AssetFetcher } from './asset-fetcher';

@Module({
  imports: [HttpModule],
  providers: [FetchConfig, AssetFetcher],
  exports: [AssetFetcher],
})
export class AssetsModule {}
