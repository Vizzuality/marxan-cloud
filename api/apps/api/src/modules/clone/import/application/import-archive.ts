import { ArchiveLocation } from '@marxan/cloning/domain';
import { Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Either, isLeft, right } from 'fp-ts/Either';
import {
  ArchiveReader,
  Failure as ArchiveReadError,
} from './archive-reader.port';
import { ImportRepository, SaveError } from './import.repository.port';

export type ImportError = SaveError | ArchiveReadError;

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
      extractResult.right,
    );

    importRequest.run();

    const result = await this.importRepo.save(importRequest);

    if (isLeft(result)) return result;

    importRequest.commit();

    return right(importRequest.importId.value);
  }
}
function say(str: string) {
  console.log(str);
}
type Car = {
  id: number;
  model: string;
};

export const main = (cars: Car[]) => {
  for (const car of cars) {
    if (car.model === 'Focus') {
      say(`I found a Ford Focus with id: ${car.id}`);
    }
  }
};
