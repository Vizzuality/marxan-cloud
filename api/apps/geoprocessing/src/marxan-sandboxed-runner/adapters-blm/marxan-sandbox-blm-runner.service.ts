import { BlmInputFiles } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-blm/blm-input-files';
import { MarxanSandboxRunnerService } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/marxan-sandbox-runner.service';
import { Cancellable } from '@marxan-geoprocessing/marxan-sandboxed-runner/ports/cancellable';
import { SandboxRunner } from '@marxan-geoprocessing/marxan-sandboxed-runner/sandbox-runner';
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
    private readonly blmResultsParser: SandboxRunnerOutputHandler<ExecutionResult>,
  ) {}

  kill(ofScenarioId: string): void {
    const controller = this.#controllers[ofScenarioId];

    if (controller && !controller.signal.aborted) controller.abort();
  }

  getOutputHandlerBridge(): SandboxRunnerOutputHandler<ExecutionResult> {
    return {
      dump: async (workspace, scenarioId, stdOutput, stdErr) => {
        const result = await this.blmResultsParser.dump(
          workspace,
          scenarioId,
          stdOutput,
          stdErr,
        );
        // TODO Store partial results
        return result;
      },
      dumpFailure: this.blmResultsParser.dumpFailure,
      cancel: async () => {},
    };
  }

  async run(
    input: JobData,
    progressCallback: (progress: number) => void,
  ): Promise<void> {
    const { blmValues, scenarioId: forScenarioId } = input;
    const workspaces = await this.inputFilesHandler.for(
      blmValues,
      input.assets,
    );
    const dummySandboxRunnerInputFiles = {
      include: async () => {},
      cancel: async () => {},
    };
    const abortController = this.getAbortControllerForRun(forScenarioId, [
      this.inputFilesHandler,
      this.blmResultsParser,
    ]);

    const interruptIfKilled = async () => {
      if (abortController.signal.aborted) {
        this.clearAbortController(forScenarioId);
        throw {
          stdError: [],
          signal: 'SIGTERM',
        };
      }
    };

    const finalResults: ExecutionResult[] = [];

    for (const { workspace } of workspaces) {
      await interruptIfKilled();
      const workspaceBuilder = { get: async () => workspace };
      const singleMarxanRun = new MarxanSandboxRunnerService(
        workspaceBuilder,
        dummySandboxRunnerInputFiles,
        this.getOutputHandlerBridge(),
      );

      const partialResult = await singleMarxanRun.run(input, progressCallback);
      finalResults.push(partialResult);
    }

    // TODO Store final results
    this.clearAbortController(forScenarioId);
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
