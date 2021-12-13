import { Injectable } from '@nestjs/common';
import { copySync, writeFileSync } from 'fs-extra';
import { Workspace } from '../ports/workspace';
import { Assets } from './blm-input-files';
import { dirname, resolve } from 'path';
import { promises } from 'fs';
import { FileReader } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/file-reader';

@Injectable()
export class AssetFactory {
  constructor(private readonly reader: FileReader) {}

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
      filter: (src) => !src.match(/marxan/),
    });

    const inputDat = this.getInputDat(assets);
    if (!inputDat) throw new Error('No URL for input.dat found');

    const inputDatPath = resolve(
      to.workingDirectory,
      inputDat.relativeDestination,
    );

    await this.ensureWriteDirectoryExists(inputDatPath);

    const input = this.reader.read(inputDatPath);

    // TODO: Why the input.dat is coming without BLM?
    // const matcher = new RegExp(/BLM\s.*/);
    const inputWithCorrectBLM = `BLM ${overrideBlmValue}\n${input}`;
    /*input.replace(
      matcher,
      `BLM ${overrideBlmValue}`,
    );*/

    writeFileSync(inputDatPath, inputWithCorrectBLM);
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
