import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import AbortController from 'abort-controller';

import { ExecutionResult } from '@marxan/marxan-output';

import { MarxanRun } from './marxan-run';
import { WorkspaceBuilder } from './ports/workspace-builder';
import { Cancellable } from './ports/cancellable';
import { Assets, InputFilesFs } from './adapters/scenario-data/input-files-fs';
import { SolutionsOutputService } from './adapters/solutions-output/solutions-output.service';

export { Assets };

@Injectable()
export class MarxanSandboxRunnerService {
  readonly #controllers: Record<string, AbortController> = {};
  readonly #logger = new Logger(this.constructor.name);

  constructor(
    private readonly workspaceService: WorkspaceBuilder,
    private readonly moduleRef: ModuleRef,
  ) {}

  kill(ofScenarioId: string): void {
    const controller = this.#controllers[ofScenarioId];
    if (controller && !controller.signal.aborted) {
      controller.abort();
    }
  }

  async run(
    forScenarioId: string,
    assets: Assets,
    progressCallback: (progress: number) => void,
  ): Promise<ExecutionResult> {
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
    console.log(`--- downloading files..`);
    await inputFiles.include(workspace, assets);
    await interruptIfKilled();
    console.log(`--- creating workspace..`);
    await workspace.arrangeOutputSpace();
    await interruptIfKilled();

    return new Promise(async (resolve, reject) => {
      marxanRun.on('error', async (result) => {
        this.clearAbortController(forScenarioId);
        await outputFilesRepository.dumpFailure(
          workspace,
          forScenarioId,
          marxanRun.stdOut,
          marxanRun.stdError,
        );
        await workspace.cleanup();
        reject(JSON.stringify(result));
      });
      marxanRun.on('finished', async () => {
        try {
          await interruptIfKilled();
          console.log(`--- dump results`);
          const output = await outputFilesRepository.dump(
            workspace,
            forScenarioId,
            marxanRun.stdOut,
            marxanRun.stdError,
          );
          console.log(`---- results dumped, cleaning up`);
          await workspace.cleanup();
          console.log(`---- cleaning done`);
          console.log(`---- resolving`, output.length);
          resolve(output);
        } catch (error) {
          reject(error);
          await outputFilesRepository
            .dumpFailure(
              workspace,
              forScenarioId,
              marxanRun.stdOut,
              marxanRun.stdError,
            )
            .catch((error) => {
              this.#logger.error(error);
            });
        } finally {
          this.clearAbortController(forScenarioId);
        }
      });
      marxanRun.on(`progress`, (progress) => progressCallback(progress));

      try {
        await interruptIfKilled();
        console.log(`--- execute marxan..`);
        marxanRun.executeIn(workspace);
        console.log(`--- execute marxan.. queued`);
      } catch (error) {
        this.clearAbortController(forScenarioId);
        reject(error);
      }
    });
  }

  private clearAbortController(ofScenarioId: string) {
    delete this.#controllers[ofScenarioId];
  }

  private getAbortControllerForRun(
    scenarioId: string,
    cancellables: Cancellable[],
  ) {
    const controller = (this.#controllers[
      scenarioId
    ] ??= new AbortController());

    controller.signal.addEventListener('abort', () => {
      cancellables.forEach((killMe) => killMe.cancel());
    });

    return controller;
  }
}
