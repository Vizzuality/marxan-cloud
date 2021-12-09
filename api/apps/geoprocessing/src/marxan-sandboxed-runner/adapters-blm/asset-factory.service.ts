import { Injectable } from '@nestjs/common';
import { copySync, writeFileSync } from 'fs-extra';
import { Workspace } from '../ports/workspace';
import { Assets } from './blm-input-files';
import { dirname, resolve } from 'path';
import { createWriteStream, promises } from 'fs';
import { AssetFetcher } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-shared';
import { FileReader } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/file-reader';

@Injectable()
export class AssetFactory {
  constructor(
    private readonly fetchService: AssetFetcher,
    private readonly reader: FileReader,
  ) {}
  async copy(
    from: Workspace,
    to: Workspace,
    assets: Assets,
    overrideBlmValue: number,
  ): Promise<void> {
    console.log(
      `copy assets from [${from.workingDirectory}] to ${to.workingDirectory} -> for blm of ${overrideBlmValue}`,
    );

    copySync(from.workingDirectory, to.workingDirectory, {
      // Marxan binary is already linked
      filter: (src, dest) => !src.match(/marxan/),
    });

    const inputDat = this.getInputDat(assets);
    if (!inputDat) throw new Error('No URL for input.dat found');

    const inputDatPath = resolve(
      to.workingDirectory,
      inputDat.relativeDestination,
    );

    await this.ensureWriteDirectoryExists(inputDatPath);

    // await this.download(
    //   inputDat.url,
    //   resolve(to.workingDirectory, inputDat.relativeDestination),
    // );

    const input = this.reader.read(inputDatPath);
    const matcher = new RegExp(/BLM\s.*/);
    const inputWithCorrectBLM = input.replace(
      matcher,
      `BLM ${overrideBlmValue}`,
    );

    writeFileSync(inputDatPath, inputWithCorrectBLM);
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

  private getInputDat(
    assets: Assets,
  ): { relativeDestination: string; url: string } | undefined {
    return assets.find((asset) => asset.url.match(/input.dat/));
  }
}
