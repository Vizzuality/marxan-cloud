import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ArchiveLocation } from '@marxan/cloning/domain';
import {
  GetExportArchive,
  GetFailure,
  locationNotFound,
} from './get-archive.query';
import { ExportRepository } from './export-repository.port';
import { Either, left, right } from 'fp-ts/Either';

@QueryHandler(GetExportArchive)
export class GetArchiveHandler
  implements IInferredQueryHandler<GetExportArchive> {
  constructor(public readonly exportRepo: ExportRepository) {}

  async execute({
    exportId,
  }: GetExportArchive): Promise<Either<GetFailure, ArchiveLocation>> {
    const archive = (await this.exportRepo.find(exportId))?.toSnapshot()
      .archiveLocation;

    return archive
      ? right(new ArchiveLocation(archive))
      : left(locationNotFound);
  }
}
