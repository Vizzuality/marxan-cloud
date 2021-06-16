import { Injectable } from '@nestjs/common';
import { MarxanConfig } from '@marxan-geoprocessing/marxan-sandboxed-runner/marxan-config';

import { Workspace } from '../../ports/workspace';

import { TemporaryDirectory } from './ports/temporary-directory';
import { LinkMarxan } from './ports/link-marxan';

@Injectable()
export class WorkspaceService implements Workspace {
  constructor(
    private readonly marxanConfig: MarxanConfig,
    private readonly workingDirectoryService: TemporaryDirectory,
    private readonly binaryLinker: LinkMarxan,
  ) {}

  async get(): Promise<{
    workingDirectory: string;
    marxanBinaryPath: string;
    cleanup: () => Promise<void>;
  }> {
    const workingDirectory = await this.workingDirectoryService.get();
    const marxanBinaryPath = workingDirectory + `/marxan`;

    await this.binaryLinker.link(this.marxanConfig.binPath, marxanBinaryPath);
    return Promise.resolve({
      cleanup: async () => {
        return this.workingDirectoryService.cleanup(workingDirectory);
      },
      marxanBinaryPath,
      workingDirectory,
    });
  }
}
