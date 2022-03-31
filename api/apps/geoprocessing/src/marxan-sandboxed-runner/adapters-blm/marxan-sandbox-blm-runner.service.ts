import { Cancellable } from '@marxan-geoprocessing/marxan-sandboxed-runner/ports/cancellable';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { JobData } from '@marxan/blm-calibration';
import { WebshotService } from '@marxan/webshot';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { EventBus } from '@nestjs/cqrs';
import { InjectEntityManager } from '@nestjs/typeorm';
import AbortController from 'abort-controller';
import { EntityManager, getManager } from 'typeorm';
import { v4 } from 'uuid';
import { SandboxRunner } from '../ports/sandbox-runner';
import { BlmFinalResultsRepository } from './blm-final-results.repository';
import { BlmInputFiles } from './blm-input-files';
import { BlmCalibrationStarted } from './events/blm-calibration-started.event';
import { MarxanRunnerFactory } from './marxan-runner.factory';

@Injectable()
export class MarxanSandboxBlmRunnerService
  implements SandboxRunner<JobData, void> {
  readonly #controllers: Record<string, AbortController> = {};

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

        // This won't work because every run has same scenarioId
        const createdFinalResult = await this.finalResultsRepository.findOneByScenarioId(
          scenarioId,
        );

        const { blmValue } = createdFinalResult;

        //array of uuid of project_pu table entities included in best solution
        //need to be joined with scenario_pu_data and planning_units_geom
        const puIds = createdFinalResult?.protected_pu_ids;

        const projectId = await this.apiEntityManager
          .createQueryBuilder()
          .select(['project_id'])
          .from('scenarios', 's')
          .where('id = :scenarioId', { scenarioId })
          .execute();

        /*
          Webshot call happens here with puIds.
          This will return the PNG data, that needs to be inserted in next call to update finalResults.
          await this.webshot.createScreenshot(puData, scenarioId, runId);
          this.interruptIfKilled(scenarioId);
        */
        // const pngStream = await this.webshotService.getBlmValuesImage(
        //   scenarioId,
        //   projectId,
        //   configForWebshot,
        //   blmValue,
        // );
        this.interruptIfKilled(scenarioId);

        // When webshot call returns -> this.finalResultsRepository.updateFinalResults(scenarioId, pngData).

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
