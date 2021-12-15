import { BlmInputFiles } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-blm/blm-input-files';
import { MarxanSandboxRunnerService } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/marxan-sandbox-runner.service';
import { Cancellable } from '@marxan-geoprocessing/marxan-sandboxed-runner/ports/cancellable';
import { WorkspaceBuilder } from '@marxan-geoprocessing/marxan-sandboxed-runner/ports/workspace-builder';
import { SandboxRunner } from '@marxan-geoprocessing/marxan-sandboxed-runner/sandbox-runner';
import { SandboxRunnerInputFiles } from '@marxan-geoprocessing/marxan-sandboxed-runner/sandbox-runner-input-files';
import { SandboxRunnerOutputHandler } from '@marxan-geoprocessing/marxan-sandboxed-runner/sandbox-runner-output-handler';
import { JobData } from '@marxan/blm-calibration';
import { ExecutionResult } from '@marxan/marxan-output';
import { Injectable } from '@nestjs/common';
import AbortController from 'abort-controller';

@Injectable()
export class MarxanSandboxBlmRunnerService
  implements SandboxRunner<JobData, void> {
  readonly #controllers: Record<string, AbortController> = {};

  constructor(
    private readonly inputFilesHandler: BlmInputFiles,
    private readonly outputHandler: SandboxRunnerOutputHandler<void>,
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
      const outputHandler: SandboxRunnerOutputHandler<ExecutionResult> = {
        dump: () => {},
      } as any;

      const singleRunner = new MarxanSandboxRunnerService(
        workspaceBuilder,
        inputFilesHandler,
        outputHandler,
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
