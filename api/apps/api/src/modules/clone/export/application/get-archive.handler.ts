import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Either, left } from 'fp-ts/Either';
import { Readable } from 'stream';
import { ExportRepository } from './export-repository.port';
import {
  exportNotFound,
  GetExportArchive,
  GetFailure,
  unfinishedExport,
} from './get-archive.query';

@QueryHandler(GetExportArchive)
export class GetArchiveHandler
  implements IInferredQueryHandler<GetExportArchive>
{
  constructor(
    private readonly exportRepo: ExportRepository,
    private readonly fileRepo: CloningFilesRepository,
  ) {}

  async execute({
    exportId,
  }: GetExportArchive): Promise<Either<GetFailure, Readable>> {
    const exportInstance = await this.exportRepo.find(exportId);

    if (!exportInstance) {
      return left(exportNotFound);
    }

    const { archiveLocation } = exportInstance.toSnapshot();

    if (!exportInstance.hasFinished() || !archiveLocation) {
      return left(unfinishedExport);
    }

    return this.fileRepo.get(archiveLocation);
  }
}
