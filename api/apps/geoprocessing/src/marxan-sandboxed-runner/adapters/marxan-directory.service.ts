import { join as joinPath } from 'path';
import { Injectable } from '@nestjs/common';

import { FileReader } from './file-reader';
import { WorkingDirectory } from '../ports/working-directory';

@Injectable()
export class MarxanDirectory {
  constructor(private readonly reader: FileReader) {}

  get(
    type: 'INPUTDIR' | 'OUTPUTDIR',
    within: WorkingDirectory,
  ): {
    name: string;
    fullPath: string;
  } {
    const config = this.reader.read(joinPath(within, 'input.dat'));
    const matcher = new RegExp(`^(${type} )(?<dir>.*)$`, 'gm');
    const inputDirectory = matcher.exec(config);
    if (inputDirectory?.groups?.dir) {
      const sourceDirectory = inputDirectory.groups.dir;
      return {
        name: sourceDirectory,
        fullPath: joinPath(within, sourceDirectory),
      };
    } else {
      throw new Error(`Cannot find ${type} directory`);
    }
  }
}
