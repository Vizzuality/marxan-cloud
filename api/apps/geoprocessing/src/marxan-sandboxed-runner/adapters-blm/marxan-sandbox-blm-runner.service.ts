import { Injectable, Logger } from '@nestjs/common';
import { JobData } from '@marxan/blm-calibration';
import { v4 } from 'uuid';

import { SandboxRunner } from '../sandbox-runner';
import { WorkspaceBuilder } from '../ports/workspace-builder';
import { BlmInputFiles } from './blm-input-files';
import { MarxanRun } from '@marxan-geoprocessing/marxan-sandboxed-runner/marxan-run';
import { Cancellable } from '@marxan-geoprocessing/marxan-sandboxed-runner/ports/cancellable';
import AbortController from 'abort-controller';
import { BlmFinalResultsRepository } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-blm/repositories/final/blm-final-results.repository';
import { BlmResultsParser } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-blm/blm-results.parser';
import { BlmPartialResultsRepository } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-blm/repositories/partial/blm-partial-results.repository';

@Injectable()
export class MarxanSandboxBlmRunnerService
  implements SandboxRunner<JobData, void> {
  readonly #controllers: Record<string, AbortController> = {};
  readonly #logger = new Logger(this.constructor.name);
  constructor(
    private readonly blmFinalRepository: BlmFinalResultsRepository,
    private readonly blmPartialRepository: BlmPartialResultsRepository,
    private readonly workspaceService: WorkspaceBuilder,
    private readonly inputFilesHandler: BlmInputFiles,
    private readonly blmResultsParser: BlmResultsParser,
  ) {}

  kill(ofScenarioId: string): void {
    const controller = this.#controllers[ofScenarioId];

    if (controller && !controller.signal.aborted) controller.abort();
  }

  async run(
    input: JobData,
    progressCallback: (progress: number) => void,
  ): Promise<void> {
    const calibrationId = v4();
    const { blmValues, scenarioId: forScenarioId } = input;
    const workspaces = await this.inputFilesHandler.for(
      blmValues,
      input.assets,
    );

    for (const { blmValue, workspace } of workspaces) {
      const marxanRun = new MarxanRun();
      const cancellables: Cancellable[] = [
        this.inputFilesHandler,
        this.blmResultsParser,
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

      await new Promise(async (resolve, reject) => {
        marxanRun.on('error', async (result) => {
          this.clearAbortController(forScenarioId);
          await this.blmResultsParser.dumpFailure(
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
            const output = await this.blmResultsParser.dump(
              workspace,
              forScenarioId,
              marxanRun.stdOut,
              marxanRun.stdError,
            );
            await this.blmPartialRepository.save(
              output,
              forScenarioId,
              blmValue,
            );
            await this.blmFinalRepository.saveBest(
              output,
              calibrationId,
              forScenarioId,
              blmValue,
            );

            await workspace.cleanup();
            resolve(output);
          } catch (error) {
            await this.blmResultsParser
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
