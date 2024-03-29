import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 } from 'uuid';
import { mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve } from 'path';

import { TemporaryDirectory } from './ports/temporary-directory';
import { WorkingDirectory } from '../../ports/working-directory';
import { MarxanDirectory } from '../../adapters-single/marxan-directory.service';
import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';

export const SharedStoragePath = Symbol('shared storage temporary directory');

@Injectable()
export class SharedStorage implements TemporaryDirectory {
  constructor(
    @Inject(SharedStoragePath) private readonly tempDirectory: string,
    private readonly marxanDirectory: MarxanDirectory,
  ) {}

  async cleanup(directory: string): Promise<void> {
    if (this.#hasPoisonNullByte(directory)) {
      throw new Error(`Hacking is not allowed.`);
    }

    if (this.#isDirectoryTraversal(directory, this.tempDirectory)) {
      throw new Error(`Directory traversal is not allowed.`);
    }
    /**
     * Leave temporary folder on filesystem according to feature flag.
     */
    if (
      !AppConfig.getBoolean(
        'storage.sharedFileStorage.cleanupTemporaryFolders',
        true,
      )
    )
      return;

    Logger.log(`deleting ${directory}`);
    await rm(directory, {
      recursive: true,
      force: true,
    });
    return;
  }

  async get(): Promise<WorkingDirectory> {
    const directory = v4();
    const fullPath = resolve(this.tempDirectory, directory) as WorkingDirectory;

    await mkdir(fullPath);

    return fullPath as WorkingDirectory;
  }

  #hasPoisonNullByte = (path: string): boolean => path.indexOf('\0') !== -1;

  #isDirectoryTraversal = (fullPath: string, rootDirectory: string) =>
    !fullPath.startsWith(rootDirectory);

  async createOutputDirectory(inside: WorkingDirectory): Promise<void> {
    const outputPath = this.marxanDirectory.get('OUTPUTDIR', inside);
    const directoryAlreadyExists = existsSync(outputPath.fullPath);

    if (!directoryAlreadyExists) await mkdir(outputPath.fullPath);
  }
}
