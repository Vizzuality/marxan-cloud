import {
  CloningFilesRepository,
  SaveFileError,
} from '@marxan/cloning-files-repository';
import {
  manifestFileRelativePath,
  signatureFileRelativePath,
} from '@marxan/cloning/infrastructure/clone-piece-data/manifest-file';
import { isDefined } from '@marxan/utils';
import { Logger } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  EventPublisher,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { Either, isLeft, right } from 'fp-ts/Either';
import { Readable } from 'stream';
import { MarkExportAsFailed } from '../../infra/export/mark-export-as-failed.command';
import { ArchiveCreator, FileDestination } from './archive-creator.port';
import { ExportRepository } from './export-repository.port';
import { ExportId, FinalizeArchive } from './finalize-archive.command';
import {
  manifestFileGenerationError,
  ManifestFileService,
  signatureFileGenerationError,
} from './manifest-file-service.port';

type ManifestAndSignatureFilesUris = {
  manifestFileDestination: FileDestination;
  signatureFileDestination: FileDestination;
};

@CommandHandler(FinalizeArchive)
export class FinalizeArchiveHandler
  implements IInferredCommandHandler<FinalizeArchive>
{
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly exportRepo: ExportRepository,
    private readonly archiveCreator: ArchiveCreator,
    private readonly eventPublisher: EventPublisher,
    private readonly manifestFileService: ManifestFileService,
    private readonly cloningFilesRepository: CloningFilesRepository,
    private readonly commandBus: CommandBus,
  ) {}

  private async logErrorAndMarkExportAsFailed(
    exportId: ExportId,
    error: string,
  ): Promise<void> {
    this.logger.error(error);

    await this.commandBus.execute(new MarkExportAsFailed(exportId, error));
  }

  private async generateManifestAndSignatureFiles(
    exportId: string,
  ): Promise<
    Either<
      | typeof manifestFileGenerationError
      | typeof signatureFileGenerationError
      | SaveFileError,
      ManifestAndSignatureFilesUris
    >
  > {
    const exportFolder =
      this.cloningFilesRepository.getFilesFolderFor(exportId);

    const manifestFile =
      await this.manifestFileService.generateManifestFileFor(exportFolder);

    if (isLeft(manifestFile)) {
      return manifestFile;
    }

    const signatureFile =
      await this.manifestFileService.generateSignatureFileFor(
        manifestFile.right,
      );

    if (isLeft(signatureFile)) {
      return signatureFile;
    }

    const manifestFileUri = await this.cloningFilesRepository.saveCloningFile(
      exportId,
      Readable.from(manifestFile.right),
      manifestFileRelativePath,
    );

    const signatureFileUri = await this.cloningFilesRepository.saveCloningFile(
      exportId,
      Readable.from(signatureFile.right),
      signatureFileRelativePath,
    );

    if (isLeft(manifestFileUri)) {
      return manifestFileUri;
    }
    if (isLeft(signatureFileUri)) {
      return signatureFileUri;
    }

    return right({
      manifestFileDestination: {
        uri: manifestFileUri.right,
        relativeDestination: manifestFileRelativePath,
      },
      signatureFileDestination: {
        uri: signatureFileUri.right,
        relativeDestination: signatureFileRelativePath,
      },
    });
  }

  async execute({ exportId }: FinalizeArchive): Promise<void> {
    const exportInstance = await this.exportRepo.find(exportId);

    if (!exportInstance) {
      this.logErrorAndMarkExportAsFailed(
        exportId,
        `${FinalizeArchiveHandler.name} could not find export ${exportId} to complete archive.`,
      );
      return;
    }

    const manifestAndSignatureFilesUris =
      await this.generateManifestAndSignatureFiles(exportId.value);

    if (isLeft(manifestAndSignatureFilesUris)) {
      this.logErrorAndMarkExportAsFailed(
        exportId,
        `${FinalizeArchiveHandler.name} could not generate manifest and/or signature files`,
      );
      return;
    }
    const { manifestFileDestination, signatureFileDestination } =
      manifestAndSignatureFilesUris.right;

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
        .concat(manifestFileDestination, signatureFileDestination),
    );

    if (isLeft(archiveResult)) {
      this.logErrorAndMarkExportAsFailed(
        exportId,
        `${FinalizeArchiveHandler.name} could not create archive for ${exportId}.`,
      );
      return;
    }

    const exportAggregate =
      this.eventPublisher.mergeObjectContext(exportInstance);

    const result = exportAggregate.complete(archiveResult.right);

    if (isLeft(result)) {
      this.logErrorAndMarkExportAsFailed(
        exportId,
        `${FinalizeArchiveHandler.name} tried to complete export with id ${exportId} but pieces were not ready.`,
      );
      return;
    }

    await this.exportRepo.save(exportAggregate);

    exportAggregate.commit();
  }
}
