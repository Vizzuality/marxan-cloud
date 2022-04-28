import { manifestFileRelativePath } from '@marxan/cloning/infrastructure/clone-piece-data/manifest-file';
import { isDefined } from '@marxan/utils';
import { Logger } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { isLeft } from 'fp-ts/Either';
import { MarkExportAsFailed } from '../../infra/export/mark-export-as-failed.command';
import { ArchiveCreator } from './archive-creator.port';
import { ExportRepository } from './export-repository.port';
import { ExportId, FinalizeArchive } from './finalize-archive.command';
import { ManifestFileService } from './manifest-file-service.port';

@CommandHandler(FinalizeArchive)
export class FinalizeArchiveHandler
  implements IInferredCommandHandler<FinalizeArchive> {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly exportRepo: ExportRepository,
    private readonly archiveCreator: ArchiveCreator,
    private readonly eventPublisher: EventPublisher,
    private readonly manifestFileService: ManifestFileService,
    private readonly commandBus: CommandBus,
  ) {}

  private async logErrorAndMarkExportAsFailed(
    exportId: ExportId,
    error: string,
  ): Promise<void> {
    this.logger.error(error);

    await this.commandBus.execute(new MarkExportAsFailed(exportId));
  }

  async execute({ exportId }: FinalizeArchive): Promise<void> {
    const exportInstance = await this.exportRepo.find(exportId);

    if (!exportInstance) {
      this.logErrorAndMarkExportAsFailed(
        exportId,
        `${FinalizeArchiveHandler.name} could not find export ${exportId.value} to complete archive.`,
      );
      return;
    }

    const manifestFile = await this.manifestFileService.generateManifestFileFor(
      exportId,
    );

    if (isLeft(manifestFile)) {
      this.logErrorAndMarkExportAsFailed(
        exportId,
        `${FinalizeArchiveHandler.name} could not generate manifest file for export with ID ${exportId.value}`,
      );
      return;
    }

    const signatureFile = await this.manifestFileService.generateSignatureFileFor(
      exportId,
      manifestFile.right.uri,
    );

    if (isLeft(signatureFile)) {
      this.logErrorAndMarkExportAsFailed(
        exportId,
        `${FinalizeArchiveHandler.name} could not generate signature file for export with ID ${exportId.value}`,
      );
      return;
    }

    const pieces = exportInstance
      .toSnapshot()
      .exportPieces.flatMap((piece) => piece.uris)
      .filter(isDefined);

    const archiveResult = await this.archiveCreator.zip(
      exportId.value,
      pieces
        .map((piece) => ({
          uri: piece.uri,
          relativeDestination: piece.relativePath,
        }))
        .concat(manifestFile.right, signatureFile.right),
    );

    if (isLeft(archiveResult)) {
      this.logErrorAndMarkExportAsFailed(
        exportId,
        `${FinalizeArchiveHandler.name} could not create archive for ${exportId.value}.`,
      );
      return;
    }

    const exportAggregate = this.eventPublisher.mergeObjectContext(
      exportInstance,
    );

    const result = exportAggregate.complete(archiveResult.right);

    if (isLeft(result)) {
      this.logErrorAndMarkExportAsFailed(
        exportId,
        `${FinalizeArchiveHandler.name} tried to complete Export with archive but pieces were not ready.`,
      );
      return;
    }

    await this.exportRepo.save(exportAggregate);

    exportAggregate.commit();
  }
}
