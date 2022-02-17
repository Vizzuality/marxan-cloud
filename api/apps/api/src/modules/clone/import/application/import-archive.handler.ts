import { JSONObject } from '@marxan-api/utils/json.type';
import { ResourceId } from '@marxan/cloning/domain';
import { checkIsResourceKind } from '@marxan/cloning/domain/resource.kind';
import {
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Either, isLeft, left, right } from 'fp-ts/Either';
import { Import } from '../domain/import/import';
import { ArchiveReader, invalidFiles } from './archive-reader.port';
import { ImportArchive, ImportError } from './import-archive.command';
import { ImportResourcePieces } from './import-resource-pieces.port';
import { ImportRepository } from './import.repository.port';

@CommandHandler(ImportArchive)
export class ImportArchiveHandler
  implements IInferredCommandHandler<ImportArchive> {
  constructor(
    private readonly archiveReader: ArchiveReader,
    private readonly importRepo: ImportRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly importResourcePieces: ImportResourcePieces,
  ) {}

  async execute({
    archiveLocation,
  }: ImportArchive): Promise<Either<ImportError, string>> {
    const exportConfigOrError = await this.archiveReader.get(archiveLocation);

    if (isLeft(exportConfigOrError)) return exportConfigOrError;

    const exportConfig = exportConfigOrError.right;

    const resourceId = ResourceId.create();
    const resourceKind = (exportConfig as JSONObject).resourceKind;

    if (!checkIsResourceKind(resourceKind)) return left(invalidFiles);

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
