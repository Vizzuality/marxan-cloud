import {
  CloningFilesRepository,
  GetFileError,
  SaveFileError,
} from '@marxan/cloning-files-repository';
import {
  manifestFileRelativePath,
  signatureFileRelativePath,
} from '@marxan/cloning/infrastructure/clone-piece-data/manifest-file';
import { readableToBuffer } from '@marxan/utils';
import { Inject, Injectable } from '@nestjs/common';
import { spawnSync } from 'child_process';
import { createSign } from 'crypto';
import { Either, left, right } from 'fp-ts/lib/Either';
import { isLeft } from 'fp-ts/lib/These';
import { Readable } from 'stream';
import { FileDestination } from '../application/archive-creator.port';
import {
  integrityCheckFailed,
  invalidSignature,
  manifestFileGenerationError,
  ManifestFilePrivateKey,
  ManifestFileService,
  signatureFileGenerationError,
} from '../application/manifest-file-service.port';
import { ExportId } from '../domain';

@Injectable()
export class NodeManifestFileService implements ManifestFileService {
  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @Inject(ManifestFilePrivateKey)
    private readonly manifestFilePrivateKey: string,
  ) {}

  private async getManifestFileReadable(
    exportFolder: string,
  ): Promise<Either<typeof manifestFileGenerationError, Buffer>> {
    const childProcess = spawnSync(
      `find ${exportFolder} -type f -exec sha256sum {} \\;`,
      { shell: true },
    );

    if (childProcess.error) {
      return left(manifestFileGenerationError);
    }

    return right(childProcess.stdout);
  }

  performIntegrityCheck(
    exportId: ExportId,
  ): Either<typeof integrityCheckFailed, true> {
    const exportFolder = this.fileRepository.getFilesFolderFor(exportId.value);

    const childProcess = spawnSync(
      `sha256sum -c ${exportFolder}/manifest.txt`,
      { shell: true },
    );

    const stdout = childProcess.stdout.toString();
    const stderr = childProcess.stderr.toString();
    const error = stdout.includes('FAILED') || stderr.length > 0;

    if (error) {
      return left(integrityCheckFailed);
    }

    return right(true);
  }

  async verifyManifestFileSignature(
    manifestFileUri: string,
  ): Promise<Either<typeof invalidSignature, true>> {
    try {
      const manifestFile = await this.fileRepository.get(manifestFileUri);

      if (isLeft(manifestFile)) {
        throw manifestFile;
      }

      const manifestFileBuffer = await readableToBuffer(manifestFile.right);

      const signer = createSign('RSA-SHA256');
      signer.update(manifestFileBuffer);
      const recalculatedSignature = signer.sign(
        this.manifestFilePrivateKey,
        'hex',
      );

      const signatureFileUri = manifestFileUri.replace(
        manifestFileRelativePath,
        signatureFileRelativePath,
      );
      const signatureFile = await this.fileRepository.get(signatureFileUri);
      if (isLeft(signatureFile)) {
        throw signatureFile;
      }
      const signatureFileBuffer = await readableToBuffer(signatureFile.right);
      const uploadedSignature = signatureFileBuffer.toString();

      if (recalculatedSignature !== uploadedSignature)
        return left(invalidSignature);

      return right(true);
    } catch (err) {
      return left(invalidSignature);
    }
  }

  async generateSignatureFileFor(
    exportId: ExportId,
    manifestFileUri: string,
  ): Promise<
    Either<
      typeof signatureFileGenerationError | SaveFileError | GetFileError,
      FileDestination
    >
  > {
    try {
      const manifestFile = await this.fileRepository.get(manifestFileUri);

      if (isLeft(manifestFile)) {
        return manifestFile;
      }

      const manifestFileBuffer = await readableToBuffer(manifestFile.right);

      const signer = createSign('RSA-SHA256');
      signer.update(manifestFileBuffer);
      const result = signer.sign(this.manifestFilePrivateKey, 'hex');

      const signatureFile = await this.fileRepository.saveCloningFile(
        exportId.value,
        Readable.from(result),
        signatureFileRelativePath,
      );

      if (isLeft(signatureFile)) return signatureFile;

      return right({
        relativeDestination: signatureFileRelativePath,
        uri: signatureFile.right,
      });
    } catch (err) {
      return left(signatureFileGenerationError);
    }
  }

  async generateManifestFileFor(
    exportId: ExportId,
  ): Promise<
    Either<typeof manifestFileGenerationError | SaveFileError, FileDestination>
  > {
    const exportFilesFolder = this.fileRepository.getFilesFolderFor(
      exportId.value,
    );
    const bufferOrError = await this.getManifestFileReadable(exportFilesFolder);

    if (isLeft(bufferOrError)) return bufferOrError;

    const manifestFile = await this.fileRepository.saveCloningFile(
      exportId.value,
      Readable.from(bufferOrError.right),
      manifestFileRelativePath,
    );

    if (isLeft(manifestFile)) return manifestFile;

    return right({
      uri: manifestFile.right,
      relativeDestination: manifestFileRelativePath,
    });
  }
}
