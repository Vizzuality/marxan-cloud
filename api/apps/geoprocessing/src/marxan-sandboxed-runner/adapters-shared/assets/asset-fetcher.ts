import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios, { CancelTokenSource } from 'axios';
import { WriteStream } from 'fs';
import { FetchConfig } from './fetch.config';
import { lastValueFrom } from 'rxjs';

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
      const assetStream = await lastValueFrom(
        this.httpService.get(sourceUri, {
          responseType: 'stream',
          headers: {
            'x-api-key': this.config.secret,
          },
          cancelToken: this.#cancelTokenSource.token,
        }),
      );
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
