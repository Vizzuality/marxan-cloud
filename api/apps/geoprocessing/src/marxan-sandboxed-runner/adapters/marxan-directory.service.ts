import { join as joinPath } from 'path';
import { Injectable } from '@nestjs/common';

import { Workspace } from '../ports/workspace';

import { FileReader } from './file-reader';

@Injectable()
export class MarxanDirectory {
  constructor(private readonly reader: FileReader) {}

  get(
    type: 'INPUTDIR' | 'OUTPUTDIR',
    within: Workspace,
  ): {
    name: string;
    fullPath: string;
  } {
    const config = this.reader.read(
      joinPath(within.workingDirectory, 'input.dat'),
    );
    const matcher = new RegExp(`(${type} )(?<dir>.*)$`, 'gm');
    const inputDirectory = matcher.exec(config);
    if (inputDirectory?.groups?.dir) {
      const sourceDirectory = inputDirectory.groups.dir;
      return {
        name: sourceDirectory,
        fullPath: joinPath(within.workingDirectory, sourceDirectory),
      };
    } else {
      throw new Error(`Cannot find ${type} directory`);
    }
  }
}
