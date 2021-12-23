import { QueryHandler, IInferredQueryHandler } from '@nestjs/cqrs';
import { ArchiveLocation } from '@marxan/cloning/domain';
import { GetExportArchive } from './get-archive.query';
import { ExportRepository } from './export-repository.port';

@QueryHandler(GetExportArchive)
export class GetArchiveHandler
  implements IInferredQueryHandler<GetExportArchive> {
  constructor(public readonly exportRepo: ExportRepository) {}

  async execute({
    exportId,
  }: GetExportArchive): Promise<ArchiveLocation | null> {
    const archive = (await this.exportRepo.find(exportId))?.toSnapshot()
      .archiveLocation;
    return archive ? new ArchiveLocation(archive) : null;
  }
}
