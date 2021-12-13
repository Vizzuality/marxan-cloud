import { Injectable } from '@nestjs/common';
import { copySync } from 'fs-extra';
import { Workspace } from '../ports/workspace';
import { Assets } from './blm-input-files';

@Injectable()
export class AssetFactory {
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

    // TODO modify input.dat file - replace "BLM" with overrideBlmValue
  }

  private getInputDat(
    assets: Assets,
  ): { relativeDestination: string } | undefined {
    return assets.find((asset) => asset.url.match(/input.dat/));
  }
}
