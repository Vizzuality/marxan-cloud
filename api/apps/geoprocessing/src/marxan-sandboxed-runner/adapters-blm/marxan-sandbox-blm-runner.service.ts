import { Injectable, Logger } from '@nestjs/common';
import { JobData } from '@marxan/blm-calibration';

import { SandboxRunner } from '../sandbox-runner';
import { WorkspaceBuilder } from '../ports/workspace-builder';
import { SandboxRunnerOutputHandler } from '../sandbox-runner-output-handler';
import { BlmInputFiles } from './blm-input-files';
import { MarxanRun } from '@marxan-geoprocessing/marxan-sandboxed-runner/marxan-run';
import { Cancellable } from '@marxan-geoprocessing/marxan-sandboxed-runner/ports/cancellable';
import AbortController from 'abort-controller';

@Injectable()
export class MarxanSandboxBlmRunnerService
  implements SandboxRunner<JobData, void> {
  readonly #controllers: Record<string, AbortController> = {};
  readonly #logger = new Logger(this.constructor.name);

  constructor(
    private readonly workspaceService: WorkspaceBuilder,
    private readonly inputFilesHandler: BlmInputFiles,
    private readonly outputFilesHandler: SandboxRunnerOutputHandler<void>,
  ) {}

  kill(ofScenarioId: string): void {}

  async run(
    input: JobData,
    progressCallback: (progress: number) => void,
  ): Promise<void> {
    const { blmValues, scenarioId: forScenarioId } = input;
    console.log(`running BLM calibration for:`, blmValues);
    const workspaces = await this.inputFilesHandler.for(
      blmValues,
      input.assets,
    );
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

    for (const { blmValue, workspace } of workspaces) {
      // run & persist
      console.log(`running for ${blmValue} - ${workspace.workingDirectory}`);

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

      await new Promise(async (resolve, reject) => {
        marxanRun.on('error', async (result) => {
          console.error(result);
          this.clearAbortController(forScenarioId);
          await this.outputFilesHandler.dumpFailure(
            workspace,
            forScenarioId,
            marxanRun.stdOut,
            marxanRun.stdError,
          );
          // await workspace.cleanup();
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
            // await workspace.cleanup();
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

      /**
       * should have its own AbortController
       * to be able to kill underlying runs
       */

      /**
       *   for each blmValue, run (sequence, chunks...)
       *   single MarxanSandboxRunnerService
       *
       *   consider creating specific BlmPartialResultsRepository
       *   for each run so that BLM value could be attached
       */

      /**
       * assets:
       *
       * single "fetch" may be performed there
       * or the SandboxRunnerInputFiles may be implemented
       * in such way to handle "single fetch"
       */

      /**
       * it may be necessary to extract some single-run-adapters-single
       * to be used there as well (like workspace)
       */
    }
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
