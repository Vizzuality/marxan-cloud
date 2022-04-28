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
import { createSign, createVerify } from 'crypto';
import { Either, left, right } from 'fp-ts/lib/Either';
import { isLeft } from 'fp-ts/lib/These';
import { Readable } from 'stream';
import { FileDestination } from '../application/archive-creator.port';
import {
  integrityCheckFailed,
  invalidSignature,
  manifestFileGenerationError,
  CloningSigningSecret,
  ManifestFileService,
  signatureFileGenerationError,
} from '../application/manifest-file-service.port';
import { ExportId } from '../domain';

@Injectable()
export class NodeManifestFileService implements ManifestFileService {
  private readonly algorithm = 'RSA-SHA256';

  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @Inject(CloningSigningSecret)
    private readonly cloningSigningSecret: string,
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
    const signatureFileUri = manifestFileUri.replace(
      manifestFileRelativePath,
      signatureFileRelativePath,
    );

    const manifestFile = await this.fileRepository.get(manifestFileUri);
    const signatureFile = await this.fileRepository.get(signatureFileUri);
    if (isLeft(signatureFile) || isLeft(manifestFile)) {
      return left(invalidSignature);
    }
    const manifestFileBuffer = await readableToBuffer(manifestFile.right);
    const signatureFileBuffer = await readableToBuffer(signatureFile.right);
    const uploadedSignature = signatureFileBuffer.toString();

    const verifier = createVerify(this.algorithm);
    verifier.update(manifestFileBuffer);

    return verifier.verify(this.cloningSigningSecret, uploadedSignature, 'hex')
      ? right(true)
      : left(invalidSignature);
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

      const signer = createSign(this.algorithm);
      signer.update(manifestFileBuffer);
      const result = signer.sign(this.cloningSigningSecret, 'hex');

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
