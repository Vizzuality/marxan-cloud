import { Injectable } from '@nestjs/common';

import { InputFiles, Assets } from './ports/input-files';
import { SolutionsRepository } from './ports/solutions-repository';
import { Workspace } from './ports/workspace';

import { MarxanRun } from './marxan-run';
import { WorkspaceBuilder } from './ports/workspace-builder';
import { Cancellable } from './ports/cancellable';
import { Assets, InputFilesFs } from './adapters/scenario-data/input-files-fs';
import { SolutionsOutputService } from './adapters/solutions-output/solutions-output.service';

@Injectable()
export class MarxanSandboxRunnerService {
  constructor(
    private readonly workspaceService: Workspace,
    private readonly inputFilesProvider: InputFiles,
    private readonly marxanRunner: MarxanRun,
    private readonly solutionsRepository: SolutionsRepository,
  ) {}

  async run(forScenarioId: string, assets: Assets): Promise<void> {
    const workspace = await this.workspaceService.get();
    const inputFiles = await this.moduleRef.create(InputFilesFs);
    const outputFilesRepository = await this.moduleRef.create(
      SolutionsOutputService,
    );
    const marxanRun = new MarxanRun();

    const cancellables: Cancellable[] = [
      inputFiles,
      outputFilesRepository,
      marxanRun,
    ];

    const controller = this.getAbortControllerForRun(
      forScenarioId,
      cancellables,
    );

    const interruptIfKilled = async () => {
      if (controller.signal.aborted) {
        await workspace.cleanup();
        this.clearAbortController(forScenarioId);
        throw {
          stdError: [],
          signal: 'SIGTERM',
        };
      }
    };

    await interruptIfKilled();
    await inputFiles.include(workspace, assets);

    return new Promise(async (resolve, reject) => {
      marxanRun.on('error', async (result) => {
        await workspace.cleanup();
        this.clearAbortController(forScenarioId);
        reject(result);
      });
      marxanRun.on('finished', async () => {
        try {
          await interruptIfKilled();
          await outputFilesRepository.saveFrom(
            workspace,
            forScenarioId,
            marxanRun.stdOut,
            [],
          );
          await workspace.cleanup();
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          this.clearAbortController(forScenarioId);
        }
      });

      try {
        await interruptIfKilled();
        marxanRun.executeIn(workspace);
      } catch (error) {
        this.clearAbortController(forScenarioId);
        reject(error);
      }
    });
  }

      this.marxanRunner.on(
        'error',
        async (result: {
          code: number | NodeJS.Signals;
          stdError: string[];
        }) => {
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
