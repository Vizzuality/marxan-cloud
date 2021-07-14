import { Injectable } from '@nestjs/common';
import { symlinkSync } from 'fs';
import { LinkMarxan } from './ports/link-marxan';

@Injectable()
export class SymlinkBinary implements LinkMarxan {
  async link(binPath: string, directoryPath: string): Promise<void> {
    symlinkSync(binPath, directoryPath, 'file');
    return;
  }
}
