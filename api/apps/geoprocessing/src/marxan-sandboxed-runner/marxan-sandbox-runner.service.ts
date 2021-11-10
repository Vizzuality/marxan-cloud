import { Injectable, Logger } from '@nestjs/common';
import AbortController from 'abort-controller';

import { ExecutionResult } from '@marxan/marxan-output';

import { MarxanRun } from './marxan-run';
import { WorkspaceBuilder } from './ports/workspace-builder';
import { Cancellable } from './ports/cancellable';
import { Assets } from './adapters/scenario-data/input-files-fs';
import { SandboxRunner } from './sandbox-runner';

import { SandboxRunnerInputFiles } from './sandbox-runner-input-files';
import { SandboxRunnerOutputHandler } from './sandbox-runner-output-handler';
import { JobData } from '@marxan/scenario-run-queue';

export { Assets };

@Injectable()
export class MarxanSandboxRunnerService
  implements SandboxRunner<JobData, ExecutionResult> {
  readonly #controllers: Record<string, AbortController> = {};
  readonly #logger = new Logger(this.constructor.name);

  constructor(
    private readonly workspaceService: WorkspaceBuilder,
    private readonly inputFilesHandler: SandboxRunnerInputFiles,
    private readonly outputFilesHandler: SandboxRunnerOutputHandler<ExecutionResult>,
  ) {}

  kill(ofScenarioId: string): void {
    const controller = this.#controllers[ofScenarioId];
    if (controller && !controller.signal.aborted) {
      controller.abort();
    }
  }

  async run(
    input: JobData,
    progressCallback: (progress: number) => void,
  ): Promise<ExecutionResult> {
    const { scenarioId: forScenarioId, assets } = input;
    const workspace = await this.workspaceService.get();
    const marxanRun = new MarxanRun();

    const cancellables: Cancellable[] = [
      this.inputFilesHandler,
      this.outputFilesHandler,
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
    await this.inputFilesHandler.include(workspace, assets);
    await interruptIfKilled();
    await workspace.arrangeOutputSpace();
    await interruptIfKilled();

    return new Promise(async (resolve, reject) => {
      marxanRun.on('error', async (result) => {
        this.clearAbortController(forScenarioId);
        await this.outputFilesHandler.dumpFailure(
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
          const output = await this.outputFilesHandler.dump(
            workspace,
            forScenarioId,
            marxanRun.stdOut,
            marxanRun.stdError,
          );
          await workspace.cleanup();
          resolve(output);
        } catch (error) {
          await this.outputFilesHandler
            .dumpFailure(
              workspace,
              forScenarioId,
              marxanRun.stdOut,
              marxanRun.stdError,
            )
            .catch((error) => {
              this.#logger.error(error);
            });
          reject(error);
        } finally {
          this.clearAbortController(forScenarioId);
        }
      });
      marxanRun.on(`progress`, (progress) => progressCallback(progress));

      try {
        await interruptIfKilled();
        marxanRun.executeIn(workspace);
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
