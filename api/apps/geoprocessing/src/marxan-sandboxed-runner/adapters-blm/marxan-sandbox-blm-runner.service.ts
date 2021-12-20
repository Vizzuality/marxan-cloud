import { BlmInputFiles } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-blm/blm-input-files';
import { Cancellable } from '@marxan-geoprocessing/marxan-sandboxed-runner/ports/cancellable';
import { JobData } from '@marxan/blm-calibration';
import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import AbortController from 'abort-controller';
import { v4 } from 'uuid';
import { SandboxRunner } from '../ports/sandbox-runner';
import { BlmFinalResultsRepository } from './blm-final-results.repository';
import { BlmCalibrationStarted } from './events/blm-calibration-started.event';
import { MarxanRunnerFactory } from './marxan-runner.factory';

@Injectable()
export class MarxanSandboxBlmRunnerService
  implements SandboxRunner<JobData, void> {
  readonly #controllers: Record<string, AbortController> = {};

  constructor(
    private readonly inputFilesHandler: BlmInputFiles,
    private readonly finalResultsRepository: BlmFinalResultsRepository,
    private readonly marxanRunnerFactory: MarxanRunnerFactory,
    private readonly eventBus: EventBus,
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
    const calibrationId = v4();

    await this.eventBus.publish(
      new BlmCalibrationStarted(scenarioId, calibrationId),
    );

    for (const { workspace, blmValue } of workspaces) {
      const singleRunner = this.marxanRunnerFactory.for(
        scenarioId,
        calibrationId,
        blmValue,
        workspace,
      );

      const cancelablesForThisRun: Cancellable[] = [
        {
          cancel: async () => singleRunner.kill(scenarioId),
        },
      ];
      this.getAbortControllerForRun(scenarioId, cancelablesForThisRun);

      await singleRunner.run(input, progressCallback);
    }

    await this.finalResultsRepository.saveFinalResults(
      scenarioId,
      calibrationId,
    );
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
