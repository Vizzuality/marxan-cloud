import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { promises } from 'fs';
import { resolve } from 'path';

import { AppConfig } from '@marxan-geoprocessing/utils/config.utils';
import { assertDefined } from '@marxan/utils';

import { TemporaryDirectory } from '../ports/temporary-directory';

@Injectable()
export class SharedStorage implements TemporaryDirectory {
  readonly #tempDirectory: string;

  constructor() {
    const storagePath = AppConfig.get<string>(
      'storage.sharedFileStorage.localPath',
    );
    assertDefined(storagePath);
    this.#tempDirectory = storagePath;
  }

  async cleanup(directory: string): Promise<void> {
    // TODO check if starts with tempDirectory
    await promises.rm(directory, {
      recursive: true,
      force: true,
    });
    return;
  }

  async get(): Promise<string> {
    const directory = v4();
    const fullPath = resolve(this.#tempDirectory, directory);
    await promises.mkdir(resolve(this.#tempDirectory, directory));
    return fullPath;
  }
}
