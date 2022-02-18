import { ResourceId } from '@marxan/cloning/domain';
import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Either, isLeft, left, right } from 'fp-ts/Either';
import { ExportConfigReader } from './export-config-reader';
import { Import } from '../domain/import/import';
import { ImportArchive, ImportError } from './import-archive.command';
import { ImportResourcePieces } from './import-resource-pieces.port';
import { ImportRepository } from './import.repository.port';

@CommandHandler(ImportArchive)
export class ImportArchiveHandler
  implements IInferredCommandHandler<ImportArchive> {
  constructor(
    private readonly exportConfigReader: ExportConfigReader,
    private readonly importRepo: ImportRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly importResourcePieces: ImportResourcePieces,
  ) {}

  async execute({
    archiveLocation,
  }: ImportArchive): Promise<Either<ImportError, string>> {
    const exportConfigOrError = await this.exportConfigReader.read(
      archiveLocation,
    );

    if (isLeft(exportConfigOrError)) return exportConfigOrError;

    const { resourceKind } = exportConfigOrError.right;

    const resourceId = ResourceId.create();

    const pieces = await this.importResourcePieces.resolveFor(
      resourceId,
      resourceKind,
      archiveLocation,
    );

    const importRequest = this.eventPublisher.mergeObjectContext(
      Import.newOne(resourceId, resourceKind, archiveLocation, pieces),
    );

    importRequest.run();

    const result = await this.importRepo.save(importRequest);

    if (isLeft(result)) return result;

    importRequest.commit();

    return right(importRequest.importId.value);
  }
}
