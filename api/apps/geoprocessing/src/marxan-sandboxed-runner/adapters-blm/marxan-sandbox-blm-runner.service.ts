import { BlmInputFiles } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-blm/blm-input-files';
import { MarxanSandboxRunnerService } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/marxan-sandbox-runner.service';
import { Cancellable } from '@marxan-geoprocessing/marxan-sandboxed-runner/ports/cancellable';
import { JobData } from '@marxan/blm-calibration';
import { ExecutionResult } from '@marxan/marxan-output';
import { Inject, Injectable } from '@nestjs/common';
import AbortController from 'abort-controller';
import { WorkspaceBuilder } from '../ports/workspace-builder';
import { SandboxRunner } from '../ports/sandbox-runner';
import { SandboxRunnerInputFiles } from '../ports/sandbox-runner-input-files';
import { SandboxRunnerOutputHandler } from '../ports/sandbox-runner-output-handler';
import { blmFinalResultsRepository } from './blm-final-results.repository';
import { blmPartialResultsRepository } from './blm-partial-results.repository';

@Injectable()
export class MarxanSandboxBlmRunnerService
  implements SandboxRunner<JobData, void> {
  readonly #controllers: Record<string, AbortController> = {};

  constructor(
    private readonly inputFilesHandler: BlmInputFiles,
    @Inject(blmPartialResultsRepository)
    private readonly partialResultsHandler: SandboxRunnerOutputHandler<ExecutionResult>,
    @Inject(blmFinalResultsRepository)
    private readonly finalResultsHandler: SandboxRunnerOutputHandler<void>,
  ) {}

  kill(ofScenarioId: string): void {
    const controller = this.#controllers[ofScenarioId];

    if (controller && !controller.signal.aborted) controller.abort();
  }

  async run(
    input: JobData,
    progressCallback: (progress: number) => void,
  ): Promise<void> {
    const { blmValues, scenarioId } = input;
    const workspaces = await this.inputFilesHandler.for(
      blmValues,
      input.assets,
    );

    for (const { workspace } of workspaces) {
      const workspaceBuilder: WorkspaceBuilder = {
        get: async () => workspace,
      };
      const inputFilesHandler: SandboxRunnerInputFiles = {
        include: async () => {
          // noop, already included by original input handler
        },
        cancel: async () => {
          // noop
        },
      };

      const singleRunner = new MarxanSandboxRunnerService(
        workspaceBuilder,
        inputFilesHandler,
        this.partialResultsHandler,
      );

      const cancelablesForThisRun: Cancellable[] = [
        {
          cancel: async () => singleRunner.kill(scenarioId),
        },
      ];
      this.getAbortControllerForRun(scenarioId, cancelablesForThisRun);

      await singleRunner.run(input, progressCallback);
    }
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
