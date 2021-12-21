import { Injectable } from '@nestjs/common';
import { InputFilesFs } from '../adapters-single/scenario-data/input-files-fs';
import { WorkspaceBuilder } from '../ports/workspace-builder';
import { AssetFactory } from './asset-factory.service';
import { BlmInputFiles } from './blm-input-files';

@Injectable()
export class BlmInputFilesFactory {
  constructor(
    private readonly workspaceService: WorkspaceBuilder,
    private readonly singleFetcher: InputFilesFs,
    private readonly copyAssets: AssetFactory,
  ) {}

  create(): BlmInputFiles {
    return new BlmInputFiles(
      this.workspaceService,
      this.singleFetcher,
      this.copyAssets,
    );
  }
}
