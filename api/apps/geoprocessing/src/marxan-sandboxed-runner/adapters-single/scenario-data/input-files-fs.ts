import { dirname, resolve } from 'path';
import { createWriteStream, promises } from 'fs';
import { Injectable } from '@nestjs/common';
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
import { AssetFetcher } from '../../adapters-shared/assets/asset-fetcher';
import { SandboxRunnerInputFiles } from '../../ports/sandbox-runner-input-files';

@Injectable()
export class InputFilesFs
  extends SandboxRunnerInputFiles
  implements Cancellable {
  constructor(private readonly fetchService: AssetFetcher) {
    super();
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

      this.fetchService.fetch(sourceUri, writer);
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

  async cancel(): Promise<void> {
    this.fetchService.cancel();
  }
}
