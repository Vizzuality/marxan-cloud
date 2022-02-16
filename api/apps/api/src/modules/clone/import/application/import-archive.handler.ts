import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Either, isLeft, right } from 'fp-ts/Either';
import { ArchiveReader } from './archive-reader.port';
import { ImportArchive, ImportError } from './import-archive.command';
import { ImportRepository } from './import.repository.port';

@CommandHandler(ImportArchive)
export class ImportArchiveHandler
  implements IInferredCommandHandler<ImportArchive> {
  constructor(
    private readonly archiveReader: ArchiveReader,
    private readonly importRepo: ImportRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({
    archiveLocation,
  }: ImportArchive): Promise<Either<ImportError, string>> {
    const extractResult = await this.archiveReader.get(archiveLocation);

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
