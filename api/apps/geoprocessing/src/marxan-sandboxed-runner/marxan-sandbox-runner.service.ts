import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import AbortController from 'abort-controller';

import { MarxanRun } from './marxan-run';
import { WorkspaceBuilder } from './ports/workspace-builder';
import { Cancellable } from './ports/cancellable';
import { Assets, InputFilesFs } from './adapters/scenario-data/input-files-fs';
import { SolutionsOutput } from './adapters/solutions-output/solutions-output';

@Injectable()
export class MarxanSandboxRunnerService {
  readonly #controllers: Record<string, AbortController> = {};

  constructor(
    private readonly workspaceService: WorkspaceBuilder,
    private readonly moduleRef: ModuleRef,
  ) {}

  kill(ofScenarioId: string): void {
    const controller = this.#controllers[ofScenarioId];
    if (controller && !controller.signal.aborted) {
      controller.abort();
    }
  }

  async run(forScenarioId: string, assets: Assets): Promise<void> {
    const workspace = await this.workspaceService.get();
    const inputFiles = await this.moduleRef.create(InputFilesFs);
    const outputFilesRepository = await this.moduleRef.create(SolutionsOutput);
    const marxanRun = new MarxanRun();

    const cancellables: Cancellable[] = [
      inputFiles,
      outputFilesRepository,
      marxanRun,
    ];

    const controller = this.getAbortControllerForRun(
      forScenarioId,
      cancellables,
    );

    const interruptIfKilled = async () => {
      if (controller.signal.aborted) {
        await workspace.cleanup();
        this.markExecutionAsEnded(forScenarioId);
        throw {
          stdError: [],
          signal: 'SIGTERM',
        };
      }
    };

    await interruptIfKilled();
    await inputFiles.include(workspace, assets);

    return new Promise(async (resolve, reject) => {
      marxanRun.on('error', async (result) => {
        await workspace.cleanup();
        this.markExecutionAsEnded(forScenarioId);
        reject(result);
      });
      marxanRun.on('finished', async () => {
        try {
          await interruptIfKilled();
          await outputFilesRepository.saveFrom(workspace, forScenarioId);
          await workspace.cleanup();
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          this.markExecutionAsEnded(forScenarioId);
        }
      });

      try {
        await interruptIfKilled();
        marxanRun.executeIn(workspace);
      } catch (error) {
        this.markExecutionAsEnded(forScenarioId);
        reject(error);
      }
    });
  }

  private markExecutionAsEnded(ofScenarioId: string) {
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
