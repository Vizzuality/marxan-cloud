import { Injectable } from '@nestjs/common';
import { MarxanConfig } from '@marxan-geoprocessing/marxan-sandboxed-runner/marxan-config';

import { WorkspaceBuilder } from '../../ports/workspace-builder';
import { Workspace } from '../../ports/workspace';
import { TemporaryDirectory } from './ports/temporary-directory';
import { LinkMarxan } from './ports/link-marxan';

@Injectable()
export class WorkspaceService implements WorkspaceBuilder {
  constructor(
    private readonly marxanConfig: MarxanConfig,
    private readonly workingDirectoryService: TemporaryDirectory,
    private readonly binaryLinker: LinkMarxan,
  ) {}

  async get(): Promise<Workspace> {
    const workingDirectory = await this.workingDirectoryService.get();
    const marxanBinaryPath = workingDirectory + `/marxan`;

    await this.binaryLinker.link(this.marxanConfig.binPath, marxanBinaryPath);

    console.log(`doing things in..`, workingDirectory);
    return new Workspace(workingDirectory, marxanBinaryPath, async () =>
      this.workingDirectoryService.cleanup(workingDirectory),
    );
  }
}
