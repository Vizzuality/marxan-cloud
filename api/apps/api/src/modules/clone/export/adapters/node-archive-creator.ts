import { Injectable } from '@nestjs/common';
import { Either, right } from 'fp-ts/Either';

import { ArchiveLocation } from '@marxan/cloning/domain';
import { FileRepository } from '@marxan/files-repository';

import {
  ArchiveCreationError,
  ArchiveCreator,
} from '../application/archive-creator.port';

@Injectable()
export class NodeArchiveCreator extends ArchiveCreator {
  constructor(private readonly fileRepository: FileRepository) {
    super();
  }

  async zip(
    files: { uri: string; relativeDestination: string }[],
  ): Promise<Either<ArchiveCreationError, ArchiveLocation>> {
    return right(new ArchiveLocation('.zip'));
  }
}
