import { Injectable, Logger } from '@nestjs/common';
import { Either, isLeft, left, right } from 'fp-ts/Either';
import * as archiver from 'archiver';
import { PassThrough } from 'stream';

import { ArchiveLocation } from '@marxan/cloning/domain';
import { FileRepository } from '@marxan/files-repository';

import {
  ArchiveCreationError,
  ArchiveCreator,
  unknownError,
  cannotCreateArchive,
  cannotStoreArchive,
  cannotGetFile,
} from '../application/archive-creator.port';

@Injectable()
export class NodeArchiveCreator extends ArchiveCreator {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly fileRepository: FileRepository) {
    super();
  }

  async zip(
    files: { uri: string; relativeDestination: string }[],
  ): Promise<Either<ArchiveCreationError, ArchiveLocation>> {
    let archivePersistencePromise: ReturnType<FileRepository['save']>;
    const passThrough = new PassThrough();
    const onPersistenceFinished = async (
      resolvePromise: (
        value: Either<ArchiveCreationError, ArchiveLocation>,
      ) => void,
    ) => {
      const result = await archivePersistencePromise;
      if (isLeft(result)) {
        return resolvePromise(left(cannotStoreArchive));
      }
      return resolvePromise(right(new ArchiveLocation(result.right)));
    };

    const requestedArchive = await this.getArchiveWithFiles(files);
    if (isLeft(requestedArchive)) {
      return requestedArchive;
    }
    const archive = requestedArchive.right;

    return new Promise<Either<ArchiveCreationError, ArchiveLocation>>(
      async (resolve) => {
        archive.on('finish', () => {}); // archive created but not yet written to
        archive.on(`error`, (error) => {
          this.logger.error(error);
          resolve(left(unknownError));
        });
        passThrough.on(`close`, onPersistenceFinished);

        archive.pipe(passThrough);

        // connect pipes before starting to flood with data
        archivePersistencePromise = this.fileRepository.save(
          passThrough,
          `zip`,
        );
        await archive.finalize();
      },
    ).catch((error) => {
      this.logger.error(error);
      return left(cannotCreateArchive);
    });
  }

  private getArchiveWithFiles = async (
    files: { uri: string; relativeDestination: string }[],
  ) => {
    const archive = archiver(`zip`, {
      zlib: { level: 9 },
    });

    // TODO Spike/Performance: do in parallel ?
    for (const file of files) {
      const result = await this.fileRepository.get(file.uri);
      if (isLeft(result)) {
        return left(cannotGetFile);
      }
      archive.append(result.right, {
        name: file.relativeDestination,
      });
    }
    return right(archive);
  };
}
