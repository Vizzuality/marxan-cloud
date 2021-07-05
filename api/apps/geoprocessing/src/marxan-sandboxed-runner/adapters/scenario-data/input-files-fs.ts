import { dirname, resolve } from 'path';
import { createWriteStream, promises } from 'fs';
import axios, { CancelTokenSource } from 'axios';
import { HttpService, Injectable } from '@nestjs/common';
import { Workspace } from '../../ports/workspace';
import { Cancellable } from '../../ports/cancellable';

export interface Settings {
  PUNAME: string;
  SPECNAME: string;
  PUVSPRNAME: string;
  BOUNDNAME: string;
}

export type Assets = {
  url: string;
  relativeDestination: string;
}[];

@Injectable()
export class InputFilesFs implements Cancellable {
  #cancelTokenSource: CancelTokenSource;

  constructor(private readonly httpService: HttpService) {
    this.#cancelTokenSource = axios.CancelToken.source();
  }

  async include(workspace: Workspace, assets: Assets): Promise<void> {
    assets.forEach((asset) => this.validateInput(asset.relativeDestination));

    await Promise.all(
      assets.map((asset) =>
        this.download(
          asset.url,
          resolve(workspace.workingDirectory, asset.relativeDestination),
        ),
      ),
    );
    return;
  }

  private async download(sourceUri: string, dest: string) {
    await this.ensureWriteDirectoryExists(dest);
    return new Promise((resolve, reject) => {
      const writer = createWriteStream(dest);
      writer.on('finish', resolve);
      writer.on('error', reject);
      // "stream" seems to be broken, does not return stream but data itself
      // https://github.com/nestjs/nest/issues/4144 - not really working
      this.httpService
        .get(sourceUri, {
          // responseType: 'stream',
          cancelToken: this.#cancelTokenSource.token,
        })
        .toPromise()
        .then((response) => {
          writer.write(response.data);
          writer.end();
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return resolve(void 0);
          }
          return reject(error);
        });
    });
  }

  private async ensureWriteDirectoryExists(
    fileDestination: string,
  ): Promise<void> {
    // if directory does not exists, it will silently "success" downloading the file while it won't be there
    const desiredDirectory = dirname(fileDestination);
    await promises.mkdir(desiredDirectory, { recursive: true });
  }

  private validateInput(assetTargetPath: string) {
    if (
      assetTargetPath.indexOf('\0') !== -1 ||
      assetTargetPath.includes('..')
    ) {
      throw new Error('Hacking is not allowed.');
    }
  }

  cancel(): Promise<void> {
    this.#cancelTokenSource.cancel();
    return Promise.resolve();
  }
}
