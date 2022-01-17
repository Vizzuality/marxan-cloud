import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { RemoveExportFiles } from '@marxan-api/modules/clone/infra/export/remove-export-files.command';
import { ExportRepository } from '@marxan-api/modules/clone/export/application/export-repository.port';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';

@CommandHandler(RemoveExportFiles)
export class RemoveExportFilesHandler
  implements IInferredCommandHandler<RemoveExportFiles> {
  constructor(
    private readonly exportRepo: ExportRepository,
    private readonly logger: Logger,
  ) {}

  async execute({ exportId }: RemoveExportFiles): Promise<void> {
    const exportInstance = await this.exportRepo.find(exportId);

    if (!exportInstance) {
      this.logger.error(
        `${RemoveExportFilesHandler.name} could not find export ${exportId.value} to remove its archives.`,
      );

      return;
    }

    exportInstance
      .toSnapshot()
      .exportPieces.flatMap((item) => item.uris)
      .forEach((location) => {
        fs.rmSync(location.uri);
      });
  }
}
