import { Injectable } from '@nestjs/common';
import { JobData } from '@marxan/blm-calibration';

import { SandboxRunner } from '../sandbox-runner';
import { WorkspaceBuilder } from '../ports/workspace-builder';
import { SandboxRunnerOutputHandler } from '../sandbox-runner-output-handler';
import { Assets, BlmInputFiles } from './blm-input-files';
import { SandboxRunnerInputFiles } from '@marxan-geoprocessing/marxan-sandboxed-runner/sandbox-runner-input-files';
import { Workspace } from '@marxan-geoprocessing/marxan-sandboxed-runner/ports/workspace';
import AbortController from 'abort-controller';
import { Cancellable } from '@marxan-geoprocessing/marxan-sandboxed-runner/ports/cancellable';
import { MarxanSandboxRunnerService } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/marxan-sandbox-runner.service';
import { ExecutionResult } from '@marxan/marxan-output';

@Injectable()
export class MarxanSandboxBlmRunnerService
  implements SandboxRunner<JobData, void> {
  readonly #controllers: Record<string, AbortController> = {};

  constructor(
    private readonly workspaceService: WorkspaceBuilder,
    private readonly inputFilesHandler: BlmInputFiles,
    // output file handler is actually BlmFinalResultsRepository
    // but it does not use any files
    private readonly outputFilesHandler: SandboxRunnerOutputHandler<void>,
  ) {}

  kill(ofScenarioId: string): void {
    // we may have different scenarios running, so very probably almost the
    // same as in MarxanSandboxRunner
  }

  async run(
    input: JobData,
    progressCallback: (progress: number) => void,
  ): Promise<void> {
    const { blmValues } = input;
    console.log(`running BLM calibration for:`, blmValues);
    const workspaces = await this.inputFilesHandler.for(
      blmValues,
      input.assets,
    );

    for (const workspace of workspaces) {
      // run & persist
      console.log(
        `running for ${workspace.blmValue} - ${workspace.workspace.workingDirectory}`,
      );

      const workspaceBuilder: WorkspaceBuilder = {
        get: async () => workspace.workspace,
      };
      const inputFilesHandler: SandboxRunnerInputFiles = {
        include: async (workspace: Workspace, assets: Assets) => {
          // noop, already included by original input handler
        },
        cancel: async () => {
          // noop
        },
      };
      // not any - should actually be BlmPartialResultsRepository which has
      // the same interface
      // there is some mismatch in generic there <T> - but possibly we can
      // ignore it, as we won't be returning anything
      const outputHandler: SandboxRunnerOutputHandler<ExecutionResult> = {} as any;

      const singleRunner = new MarxanSandboxRunnerService(
        workspaceBuilder,
        inputFilesHandler,
        outputHandler,
      );

      // possibly like this
      const cancelablesForThisRun: Cancellable[] = [
        {
          cancel: async () => singleRunner.kill(input.scenarioId),
        },
      ];

      await singleRunner.run(input, () => {});
    }

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

    return Promise.resolve(undefined);
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
