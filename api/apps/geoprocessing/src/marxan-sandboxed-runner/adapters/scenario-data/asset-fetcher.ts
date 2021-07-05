import { HttpService, Injectable } from '@nestjs/common';
import { WriteStream } from 'fs';
import { FetchConfig } from './fetch.config';

@Injectable()
export class AssetFetcher {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: FetchConfig,
  ) {}

  async fetch(sourceUri: string, output: WriteStream): Promise<void> {
    const assetStream = await this.httpService
      .get(sourceUri, {
        responseType: 'stream',
        headers: {
          'x-api-key': this.config.secret,
        },
      })
      .toPromise();

    assetStream.data.pipe(output);
  }
}
