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
  readonly #runs: Record<string, Record<string, Cancellable[]>> = {};
  readonly #controllers: Record<string, AbortController> = {};

  constructor(
    private readonly workspaceService: WorkspaceBuilder,
    private readonly moduleRef: ModuleRef,
  ) {}

  kill(ofScenarioId: string): void {
    this.#controllers[ofScenarioId]?.abort();
  }

  async run(forScenarioId: string, assets: Assets): Promise<void> {
    const workspace = await this.workspaceService.get();
    const cancellables: Cancellable[] = [];
    const controller = (this.#controllers[
      forScenarioId
    ] ??= new AbortController());
    const inputFiles = await this.moduleRef.create(InputFilesFs);
    const outputFilesRepository = await this.moduleRef.create(SolutionsOutput);
    const marxanRun = new MarxanRun();
    cancellables.push(inputFiles);
    cancellables.push(outputFilesRepository);
    cancellables.push(marxanRun);

    controller.signal.addEventListener('abort', () => {
      cancellables.forEach((killMe) => killMe.cancel());
    });
    if (controller.signal.aborted) {
      await workspace.cleanup();
      throw {
        stdError: [],
        signal: 'SIGTERM',
      };
    }
    await inputFiles.include(workspace, assets);

    return new Promise(async (resolve, reject) => {
      const interruptIfKilled = async () => {
        if (controller.signal.aborted) {
          await workspace.cleanup();
          return reject({
            stdError: [],
            signal: 'SIGTERM',
          });
        }
      };

      marxanRun.on('error', async (result) => {
        await workspace.cleanup();
        reject(result);
      });
      marxanRun.on('finished', async () => {
        await interruptIfKilled();
        await outputFilesRepository.saveFrom(workspace, forScenarioId);
        await workspace.cleanup();
        resolve();
      });

      await interruptIfKilled();
      marxanRun.executeIn(workspace);
    });
  }
}
