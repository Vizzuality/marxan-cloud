import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { promises } from 'fs';
import { resolve } from 'path';

import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';
import { assertDefined } from '@marxan/utils';

import { TemporaryDirectory } from './ports/temporary-directory';
import { WorkingDirectory } from '../../ports/working-directory';
import { MarxanDirectory } from '../marxan-directory.service';

@Injectable()
export class SharedStorage implements TemporaryDirectory {
  readonly #tempDirectory: string;

  constructor(private readonly marxanDirectory: MarxanDirectory) {
    const storagePath = AppConfig.get<string>(
      'storage.sharedFileStorage.localPath',
    );
    assertDefined(storagePath);
    this.#tempDirectory = storagePath;
  }

  async cleanup(directory: string): Promise<void> {
    if (this.#hasPoisonNullByte(directory)) {
      throw new Error(`Hacking is not allowed.`);
    }
    await promises.rm(directory, {
      recursive: true,
      force: true,
    });
    return;
  }

  async get(): Promise<WorkingDirectory> {
    const directory = v4();
    const fullPath = resolve(
      this.#tempDirectory,
      directory,
    ) as WorkingDirectory;

    await promises.mkdir(resolve(this.#tempDirectory, directory));

    return fullPath as WorkingDirectory;
  }

  #hasPoisonNullByte = (path: string): boolean => path.indexOf('\0') !== -1;

  async createOutputDirectory(inside: WorkingDirectory): Promise<void> {
    const outputPath = this.marxanDirectory.get('OUTPUTDIR', inside);
    await promises.mkdir(outputPath.fullPath);
  }
}
