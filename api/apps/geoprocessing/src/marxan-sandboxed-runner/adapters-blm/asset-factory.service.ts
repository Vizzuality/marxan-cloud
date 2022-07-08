import { Injectable, Logger } from '@nestjs/common';
import { writeFileSync } from 'fs-extra';
import { Workspace } from '../ports/workspace';
import { Assets } from './blm-input-files';
import { resolve } from 'path';
import { FileReader } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/file-reader';
import { execSync } from 'child_process';

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

    /**
     * The original implementation using fs-extra.copySync() would throw an
     * exception (and fail to copy assets over) when used over a CIFS mount.
     * This could be avoided by tuning the CIFS mount options, however "just"
     * using plain `cp` (which does emit warnings about ownership and
     * permissions not being retained, but copies files successfully
     * nevertheless) seems more robust overall (until we can rely on `cp` being
     * available in the base image, of course).
     *
     * execSync() will throw an exception even if it copies files successfully,
     * because of EPERM, so we mask the exception here (if there is a genuine
     * error, the process will fail anyway as the Marxan solver will exit with
     * non-zero status).
     */
    try {
      execSync(`cp -a -f ${from.workingDirectory}/* ${to.workingDirectory}`);
    } catch (e) {
      Logger.error(e);
    }

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
