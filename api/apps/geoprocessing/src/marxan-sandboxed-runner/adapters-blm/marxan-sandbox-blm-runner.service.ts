import { Cancellable } from '@marxan-geoprocessing/marxan-sandboxed-runner/ports/cancellable';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';
import { JobData } from '@marxan/blm-calibration';
import { WebshotService } from '@marxan/webshot';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { EventBus } from '@nestjs/cqrs';
import { InjectEntityManager } from '@nestjs/typeorm';
import AbortController from 'abort-controller';
import { isLeft } from 'fp-ts/lib/Either';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { SandboxRunner } from '../ports/sandbox-runner';
import { BlmFinalResultsRepository } from './blm-final-results.repository';
import { BlmInputFiles } from './blm-input-files';
import { BlmCalibrationStarted } from './events/blm-calibration-started.event';
import { MarxanRunnerFactory } from './marxan-runner.factory';
import { Logger } from '@nestjs/common';

@Injectable()
export class MarxanSandboxBlmRunnerService
  implements SandboxRunner<JobData, void> {
  readonly #controllers: Record<string, AbortController> = {};
  private readonly logger: Logger = new Logger('Marxan Sandbox Blm Runner');

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly finalResultsRepository: BlmFinalResultsRepository,
    private readonly marxanRunnerFactory: MarxanRunnerFactory,
    private readonly eventBus: EventBus,
    private readonly webshotService: WebshotService,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
  ) {}

  kill(ofScenarioId: string): void {
    const controller = this.#controllers[ofScenarioId];
    if (controller && !controller.signal.aborted) {
      controller.abort();
    }
  }

  private interruptIfKilled(scenarioId: string): void {
    const controller = this.#controllers[scenarioId];

    if (controller && controller.signal.aborted) {
      this.clearAbortController(scenarioId);
      throw {
        stdError: [],
        signal: 'SIGTERM',
      };
    }
  }

  async run(
    input: JobData,
    progressCallback: (progress: number) => void,
  ): Promise<void> {
    const { blmValues, scenarioId } = input;
    const calibrationId = v4();

    const projectId = await this.apiEntityManager
      .createQueryBuilder()
      .select(['project_id'])
      .from('scenarios', 's')
      .where('id = :scenarioId', { scenarioId })
      .getRawOne();

    const webshotUrl = AppConfig.get('webshot.url') as string;

    this.eventBus.publish(new BlmCalibrationStarted(scenarioId, calibrationId));

    const inputFilesHandler = await this.moduleRef.create(BlmInputFiles);
    const abortController = this.getAbortControllerForRun(scenarioId, [
      inputFilesHandler,
      this.finalResultsRepository,
    ]);

    return new Promise<void>(async (resolve, reject) => {
      try {
        this.interruptIfKilled(scenarioId);
        const workspaces = await inputFilesHandler.for(blmValues, input.assets);

        this.interruptIfKilled(scenarioId);

        for (const { workspace, blmValue } of workspaces) {
          const singleRunner = this.marxanRunnerFactory.for(
            scenarioId,
            calibrationId,
            blmValue,
            workspace,
          );

          const abortEventListener = () => {
            singleRunner.kill(scenarioId);
          };
          abortController.signal.addEventListener('abort', abortEventListener);

          await singleRunner.run(input, progressCallback).catch((err) => {
            reject(err);
          });
          abortController.signal.removeEventListener(
            'abort',
            abortEventListener,
          );
        }
        this.interruptIfKilled(scenarioId);

        await this.finalResultsRepository.saveFinalResults(
          scenarioId,
          calibrationId,
        );

        for (const { blmValue } of workspaces) {
          const pngStream = await this.webshotService.getBlmValuesImage(
            scenarioId,
            projectId,
            {
              ...input.config,
              screenshotOptions: {
                clip: { x: 0, y: 0, width: 500, height: 500 },
              },
            },
            blmValue,
            webshotUrl,
          );

          if (isLeft(pngStream)) {
            this.logger.error(
              `Could not add PNG data for blm run for scenario ID: ${scenarioId} and blmValue: ${blmValue}`,
            );
            continue;
          }

          await this.finalResultsRepository.updatePngDataOnFinalResults(
            scenarioId,
            blmValue,
            pngStream.right,
          );
        }
        this.interruptIfKilled(scenarioId);

        this.clearAbortController(scenarioId);
        this.interruptIfKilled(scenarioId);
      } catch (err) {
        reject(err);
      }
      resolve();
    });
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

  private clearAbortController(ofScenarioId: string) {
    delete this.#controllers[ofScenarioId];
  }
}
