import { Injectable } from '@nestjs/common';
import { Archive } from './archive';

@Injectable()
export class MetadataArchiver {
  async zip(fullPath: string): Promise<string> {
    const archive = new Archive(fullPath, fullPath + '.zip');
    await archive.zip();
    return archive.targetArchivePath;
  }
}
