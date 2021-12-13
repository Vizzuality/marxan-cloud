import { ArchiveLocation } from '@marxan/cloning/domain';
import { Injectable } from '@nestjs/common';

import { ArchiveCreator } from '../application/archive-creator.port';

@Injectable()
export class NodeArchiveCreator extends ArchiveCreator {
  async zip(
    files: { uri: string; relativeDestination: string }[],
  ): Promise<ArchiveLocation> {
    return new ArchiveLocation('.zip');
  }
}
