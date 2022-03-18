import { HttpService, Injectable } from '@nestjs/common';
import axios, { CancelTokenSource } from 'axios';
import { WriteStream } from 'fs';
import { lastValueFrom } from 'rxjs';
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
    try {
      const assetStream = await lastValueFrom(this.httpService
        .get(sourceUri, {
          responseType: 'stream',
          headers: {
            'x-api-key': this.config.secret,
          },
          cancelToken: this.#cancelTokenSource.token,
        }));
      assetStream.data.pipe(output);
    } catch (error) {
      output.end();
      return;
    }
  }

  cancel(): void {
    this.#cancelTokenSource.cancel();
  }
}
