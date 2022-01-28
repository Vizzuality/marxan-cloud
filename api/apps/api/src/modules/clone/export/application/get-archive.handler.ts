import { FileRepository } from '@marxan/files-repository';
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Either, left } from 'fp-ts/Either';
import { Readable } from 'stream';
import { ExportRepository } from './export-repository.port';
import {
  GetExportArchive,
  GetFailure,
  locationNotFound,
} from './get-archive.query';

@QueryHandler(GetExportArchive)
export class GetArchiveHandler
  implements IInferredQueryHandler<GetExportArchive> {
  constructor(
    private readonly exportRepo: ExportRepository,
    private readonly fileRepo: FileRepository,
  ) {}

  async execute({
    exportId,
  }: GetExportArchive): Promise<Either<GetFailure, Readable>> {
    const location = (await this.exportRepo.find(exportId))?.toSnapshot()
      .archiveLocation;

    if (!location) return left(locationNotFound);

    return this.fileRepo.get(location);
  }
}
