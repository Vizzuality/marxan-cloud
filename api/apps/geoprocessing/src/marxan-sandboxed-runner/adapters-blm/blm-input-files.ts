import { Workspace } from '../ports/workspace';
import { WorkspaceBuilder } from '../ports/workspace-builder';
import { InputFilesFs } from '../adapters-single/scenario-data/input-files-fs';
import { Cancellable } from '../ports/cancellable';
import { AssetFactory } from './asset-factory.service';
import { Injectable } from '@nestjs/common';

export type Assets = {
  url: string;
  relativeDestination: string;
}[];

export type BlmWorkspace = {
  blmValue: number;
  workspace: Workspace;
};

@Injectable()
export class BlmInputFiles implements Cancellable {
  #workspaces: Workspace[] = [];
  #hasBeenCanceled = false;

  constructor(
    private readonly workspaceService: WorkspaceBuilder,
    private readonly singleFetcher: InputFilesFs,
    private readonly copyAssets: AssetFactory,
  ) {}

  async for(blmValues: number[], assets: Assets): Promise<BlmWorkspace[]> {
    await this.interruptIfKilled();
    const rootWorkspace = await this.workspaceService.get();

    await this.interruptIfKilled();

    const workspaces: BlmWorkspace[] = await Promise.all(
      blmValues.map(async (blmValue) => ({
        blmValue,
        workspace: await this.workspaceService.get(),
      })),
    );

    await this.interruptIfKilled();
    await this.singleFetcher.include(rootWorkspace, assets);
    await this.interruptIfKilled();

    for (const workspace of workspaces) {
      await this.interruptIfKilled();

      this.#workspaces.push(workspace.workspace);

      await this.copyAssets.copy(
        rootWorkspace,
        workspace.workspace,
        assets,
        workspace.blmValue,
      );

      await this.interruptIfKilled();

      await workspace.workspace.arrangeOutputSpace();
    }

    await rootWorkspace.cleanup();

    return workspaces;
  }

  async cancel(): Promise<void> {
    await this.singleFetcher.cancel();
    this.#hasBeenCanceled = true;
  }

  async interruptIfKilled() {
    if (this.#hasBeenCanceled) {
      await this.cleanup();
      throw {
        stdError: [],
        signal: 'SIGTERM',
      };
    }
  }

  async cleanup(): Promise<void> {
    await Promise.all(this.#workspaces.map((workspace) => workspace.cleanup()));
  }
}
