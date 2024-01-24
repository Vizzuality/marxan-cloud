import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import {
  ClonePiece,
  ComponentId,
  ComponentLocationSnapshot,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ProjectExportConfigContent } from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import {
  manifestFileRelativePath,
  signatureFileRelativePath,
} from '@marxan/cloning/infrastructure/clone-piece-data/manifest-file';
import { isMarxanExecutionMetadataFolderRelativePath } from '@marxan/cloning/infrastructure/clone-piece-data/marxan-execution-metadata';
import { readableToBuffer } from '@marxan/utils';
import { unknownError } from '@marxan/utils/file-operations';
import { Logger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { Entry, Parse } from 'unzipper';
import { ExportId } from '../../export';
import { ExportRepository } from '../../export/application/export-repository.port';
import { ManifestFileService } from '../../export/application/manifest-file-service.port';
import { Export, ExportComponent } from '../../export/domain';
import { ExportConfigReader } from '../../import/application/export-config-reader';
import {
  cloningExportProvided,
  errorSavingExport,
  errorStoringCloningFile,
  GenerateExportFromZipFile,
  GenerateExportFromZipFileError,
  invalidExportZipFile,
} from './generate-export-from-zip-file.command';

@CommandHandler(GenerateExportFromZipFile)
export class GenerateExportFromZipFileHandler
  implements IInferredCommandHandler<GenerateExportFromZipFile>
{
  private readonly logger: Logger = new Logger(
    GenerateExportFromZipFileHandler.name,
  );

  constructor(
    private readonly exportConfigReader: ExportConfigReader,
    private readonly fileRepository: CloningFilesRepository,
    private readonly exportRepo: ExportRepository,
    private readonly manifestFileService: ManifestFileService,
  ) {}

  private storeCloningFiles(
    exportId: string,
    zipReadable: Readable,
  ): Promise<
    Either<
      typeof errorStoringCloningFile | typeof unknownError,
      Record<string, string>
    >
  > {
    const uris: Record<string, string> = {};
    let error = false;

    return new Promise<
      Either<
        typeof errorStoringCloningFile | typeof unknownError,
        Record<string, string>
      >
    >((resolve) => {
      zipReadable
        .pipe(Parse())
        .on('entry', async (entry: Entry) => {
          if (entry.type !== 'File' || error) {
            entry.autodrain();
            return;
          }

          const result = await this.fileRepository.saveCloningFile(
            exportId,
            entry,
            entry.path,
          );

          if (isLeft(result)) {
            error = true;
            return;
          }

          uris[entry.path] = result.right;
        })
        .on('close', () => {
          if (error) {
            this.logger.error(error);
            resolve(left(errorStoringCloningFile));
            return;
          }

          resolve(right(uris));
        })
        .on('error', () => {
          this.logger.error(error);
          resolve(left(errorStoringCloningFile));
        });
    });
  }

  private getExportComponents(
    resourceId: string,
    uris: Record<string, string>,
    exportPieces: ProjectExportConfigContent['pieces'],
    scenariosData: ProjectExportConfigContent['scenarios'],
  ): ExportComponent[] {
    const projectPieces = exportPieces.project.map((piece) => {
      const relativePath = ClonePieceRelativePathResolver.resolveFor(piece);
      const uri = uris[relativePath];
      return ExportComponent.fromSnapshot({
        finished: true,
        id: ComponentId.create().value,
        piece,
        resourceId,
        uris: [
          {
            relativePath,
            uri,
          },
        ],
      });
    });
    const scenarioPieces = scenariosData.flatMap((data) => {
      const pieces = exportPieces.scenarios[data.id];
      return pieces.map((piece) => {
        const relativePath = ClonePieceRelativePathResolver.resolveFor(piece, {
          kind: ResourceKind.Project,
          scenarioId: data.id,
          scenarioName: data.name,
        });
        const uri = uris[relativePath];
        const urisArray: ComponentLocationSnapshot[] = [];
        if (uri) {
          urisArray.push({ uri, relativePath });
        }

        // We should include marxan execution metadata folders uris
        if (piece === ClonePiece.MarxanExecutionMetadata) {
          urisArray.push(
            ...Object.keys(uris)
              .filter((path) =>
                isMarxanExecutionMetadataFolderRelativePath(path),
              )
              .map((path) => {
                return { relativePath: path, uri: uris[path] };
              }),
          );
        }

        return ExportComponent.fromSnapshot({
          finished: true,
          id: ComponentId.create().value,
          piece,
          resourceId: data.id,
          uris: urisArray,
        });
      });
    });

    return [...projectPieces, ...scenarioPieces];
  }

  // We are assuming that standalone scenario imports are not supported
  async execute({
    file,
    ownerId,
  }: GenerateExportFromZipFile): Promise<
    Either<GenerateExportFromZipFileError, ExportId>
  > {
    const exportConfigOrError = await this.exportConfigReader.read(
      Readable.from(file.buffer),
    );

    if (isLeft(exportConfigOrError)) {
      return left(invalidExportZipFile);
    }

    const {
      exportId: stringExportId,
      resourceKind,
      resourceId: stringResourceId,
      pieces,
      scenarios,
    } = exportConfigOrError.right as ProjectExportConfigContent;

    if (resourceKind !== ResourceKind.Project) {
      return left(invalidExportZipFile);
    }

    const exportId = new ExportId(stringExportId);
    const previousExport = await this.exportRepo.find(exportId);
    if (previousExport) {
      if (previousExport.importResourceId) return left(cloningExportProvided);

      return right(exportId);
    }

    const urisOrError = await this.storeCloningFiles(
      exportId.value,
      Readable.from(file.buffer),
    );
    const storeZipResult = await this.fileRepository.saveZipFile(
      exportId.value,
      Readable.from(file.buffer),
    );

    if (isLeft(urisOrError) || isLeft(storeZipResult)) {
      return left(errorStoringCloningFile);
    }

    const exportFilesFolder = this.fileRepository.getFilesFolderFor(
      exportId.value,
    );
    const manifestFilePath = `${exportFilesFolder}/${manifestFileRelativePath}`;
    const signatureFilePath = `${exportFilesFolder}/${signatureFileRelativePath}`;

    const manifestFileReadable =
      await this.fileRepository.get(manifestFilePath);
    const signatureFileReadable =
      await this.fileRepository.get(signatureFilePath);

    if (isLeft(manifestFileReadable) || isLeft(signatureFileReadable)) {
      return left(invalidExportZipFile);
    }

    const manifestFile = await readableToBuffer(manifestFileReadable.right);
    const signatureFile = await readableToBuffer(signatureFileReadable.right);

    const signatureVerificationResult =
      await this.manifestFileService.verifyManifestFileSignature(
        manifestFile,
        signatureFile,
      );

    if (isLeft(signatureVerificationResult)) {
      await this.fileRepository.deleteExportFolder(exportId.value);
      return signatureVerificationResult;
    }

    const integrityCheckResult =
      this.manifestFileService.performIntegrityCheck(manifestFilePath);

    if (isLeft(integrityCheckResult)) {
      await this.fileRepository.deleteExportFolder(exportId.value);
      return integrityCheckResult;
    }

    const exportComponents = this.getExportComponents(
      stringResourceId,
      urisOrError.right,
      pieces,
      scenarios,
    );
    const foreignExport = true;
    const exportInstance = Export.fromSnapshot({
      createdAt: new Date(),
      exportPieces: exportComponents.map((component) => component.toSnapshot()),
      foreignExport,
      id: exportId.value,
      ownerId: ownerId.value,
      resourceId: stringResourceId,
      resourceKind,
      archiveLocation: storeZipResult.right,
    });

    const saveResult = await this.exportRepo.save(exportInstance);

    if (isLeft(saveResult)) {
      return left(errorSavingExport);
    }

    return right(exportId);
  }
}
