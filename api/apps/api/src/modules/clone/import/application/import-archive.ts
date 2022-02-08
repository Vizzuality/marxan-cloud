import { Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Either, isLeft, right } from 'fp-ts/Either';

import { ArchiveLocation } from '@marxan/cloning/domain';
import { Import } from '../domain';

import {
  ArchiveReader,
  Failure as ArchiveReadError,
} from './archive-reader/archive-reader.port';
import {
  Failure as PersistenceError,
  ImportRepository,
} from './import-repository/import.repository.port';

export type ImportError = PersistenceError | ArchiveReadError;

@Injectable()
export class ImportArchive {
  constructor(
    private readonly archiveReader: ArchiveReader,
    private readonly importRepo: ImportRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async import(
    fromArchive: ArchiveLocation,
  ): Promise<Either<ImportError, string>> {
    const extractResult = await this.archiveReader.get(fromArchive);

    if (isLeft(extractResult)) return extractResult;

    const importRequest = this.eventPublisher.mergeObjectContext(
      Import.new(extractResult.right),
    );

    const result = await this.importRepo.save(importRequest);

    if (isLeft(result)) return result;

    importRequest.commit();

    return right(importRequest.id.value);
  }
}
