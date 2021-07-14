import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import AbortController from 'abort-controller';

import { ExecutionResult } from '@marxan/marxan-output';

import { MarxanRun } from './marxan-run';
import { WorkspaceBuilder } from './ports/workspace-builder';
import { Cancellable } from './ports/cancellable';
import { Assets, InputFilesFs } from './adapters/scenario-data/input-files-fs';
import { SolutionsOutputService } from './adapters/solutions-output/solutions-output.service';

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

  async run(forScenarioId: string, assets: Assets): Promise<ExecutionResult> {
    const workspace = await this.workspaceService.get();
    const inputFiles = await this.moduleRef.create(InputFilesFs);
    const outputFilesRepository = await this.moduleRef.create(
      SolutionsOutputService,
    );
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
        this.clearAbortController(forScenarioId);
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
        this.clearAbortController(forScenarioId);
        reject(result);
      });
      marxanRun.on('finished', async () => {
        try {
          await interruptIfKilled();
          const output = await outputFilesRepository.dump(
            workspace,
            forScenarioId,
            marxanRun.stdOut,
            [],
          );
          // await workspace.cleanup();
          resolve(output);
        } catch (error) {
          reject(error);
        } finally {
          this.clearAbortController(forScenarioId);
        }
      });

      try {
        await interruptIfKilled();
        marxanRun.executeIn(workspace);
      } catch (error) {
        this.clearAbortController(forScenarioId);
        reject(error);
      }
    });
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
