import { dirname, resolve } from 'path';
import { createWriteStream, promises } from 'fs';
import { Injectable } from '@nestjs/common';
import { Assets, InputFiles } from '../../ports/input-files';
import { AssetFetcher } from './asset-fetcher';

@Injectable()
export class DeriveScenarioFacade implements InputFiles {
  constructor(private readonly fetchService: AssetFetcher) {}

  async include(directory: string, assets: Assets): Promise<void> {
    assets.forEach((asset) => this.validateInput(asset.relativeDestination));

    await Promise.all(
      assets.map((asset) =>
        this.download(asset.url, resolve(directory, asset.relativeDestination)),
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
}
