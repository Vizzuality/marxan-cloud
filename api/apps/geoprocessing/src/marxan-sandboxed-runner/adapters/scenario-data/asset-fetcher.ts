import { HttpService, Injectable } from '@nestjs/common';
import axios, { CancelTokenSource } from 'axios';
import { WriteStream } from 'fs';
import { FetchConfig } from './fetch.config';

@Injectable()
export class AssetFetcher {
  #cancelTokenSource: CancelTokenSource;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: FetchConfig,
  ) {
    this.#cancelTokenSource = axios.CancelToken.source();
  }

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

  cancel(): void {
    this.#cancelTokenSource.cancel();
  }
}
