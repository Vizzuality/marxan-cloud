import { Injectable } from '@nestjs/common';
import { copySync, writeFileSync } from 'fs-extra';
import { Workspace } from '../ports/workspace';
import { Assets } from './blm-input-files';
import { resolve } from 'path';
import { FileReader } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/file-reader';

@Injectable()
export class AssetFactory {
  constructor(private readonly reader: FileReader) {}

  async copy(
    from: Workspace,
    to: Workspace,
    assets: Assets,
    blmValueForCurrentRun: number,
  ): Promise<void> {
    console.log(
      `copy assets from [${from.workingDirectory}] to ${to.workingDirectory} -> for blm of ${blmValueForCurrentRun}`,
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

    const inputDatContent = this.reader.read(inputDatPath);
    const inputDatContentWithBlmForCurrentRun = this.replaceBLMValue(
      inputDatContent,
      blmValueForCurrentRun,
    );

    writeFileSync(inputDatPath, inputDatContentWithBlmForCurrentRun);
  }

  private replaceBLMValue(inputDatContent: string, blmValue: number): string {
    const matcher = new RegExp(/^BLM\s.*$/);
    const containsBLMValue = matcher.test(inputDatContent);

    if (containsBLMValue)
      return inputDatContent.replace(matcher, `BLM ${blmValue}\n`);

    return `${inputDatContent}\nBLM ${blmValue}`;
  }

  private getInputDat(
    assets: Assets,
  ): { relativeDestination: string; url: string } | undefined {
    return assets.find((asset) => asset.url.match(/input.dat/));
  }
}
