import { Injectable } from '@nestjs/common';

import { InputFiles } from './ports/input-files';
import { SolutionsRepository } from './ports/solutions-repository';
import { Workspace } from './ports/workspace';

import { MarxanRun } from './marxan-run';

@Injectable()
export class MarxanSandboxRunnerService {
  constructor(
    private readonly workspaceService: Workspace,
    private readonly inputFilesProvider: InputFiles,
    private readonly marxanRunner: MarxanRun,
    private readonly solutionsRepository: SolutionsRepository,
  ) {}

  async run(forScenarioId: string): Promise<void> {
    const {
      cleanup,
      marxanBinaryPath,
      workingDirectory,
    } = await this.workspaceService.get();
    // useful to check output within docker, during development - needs `cleanup()` to be commented out
    console.log(`doing things in..`, workingDirectory);

    await this.inputFilesProvider.include(forScenarioId, workingDirectory);

    return new Promise((resolve, reject) => {
      this.marxanRunner.on(`pid`, (_pid: number) => {
        // we will need PID for canceling the job
      });

      this.marxanRunner.on(
        'error',
        async (result: { code: number; stdError: string[] }) => {
          await cleanup();
          reject(result);
        },
      );
      this.marxanRunner.on('finished', async () => {
        await this.solutionsRepository.saveFrom(
          workingDirectory,
          forScenarioId,
        );
        await cleanup();

        resolve();
      });

      this.marxanRunner.execute(marxanBinaryPath, workingDirectory);
    });
  }
}
