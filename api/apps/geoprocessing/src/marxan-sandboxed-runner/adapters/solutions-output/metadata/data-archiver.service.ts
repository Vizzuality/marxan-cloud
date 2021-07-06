import { Injectable } from '@nestjs/common';
import { Workspace } from '../../../ports/workspace';
import { MarxanDirectory } from '../../marxan-directory.service';
import { Archive } from './archive';

@Injectable()
export class MetadataArchiver {
  constructor(private readonly directoryResolver: MarxanDirectory) {}

  async zipInput(workspace: Workspace): Promise<string> {
    const { fullPath } = this.directoryResolver.get('INPUTDIR', workspace);
    const archive = new Archive(fullPath, fullPath + '.zip');
    await archive.zip();
    return archive.targetArchivePath;
  }

  async zipOutput(workspace: Workspace): Promise<string> {
    const { fullPath } = this.directoryResolver.get('OUTPUTDIR', workspace);
    const archive = new Archive(fullPath, fullPath + '.zip');
    await archive.zip();
    return archive.targetArchivePath;
  }
}
