import { Inject, Injectable } from '@nestjs/common';
import { spawnSync } from 'child_process';
import { createSign, createVerify } from 'crypto';
import { Either, left, right } from 'fp-ts/lib/Either';
import {
  CloningSigningSecret,
  integrityCheckFailed,
  invalidSignature,
  manifestFileGenerationError,
  ManifestFileService,
  signatureFileGenerationError,
} from '../application/manifest-file-service.port';

@Injectable()
export class NodeManifestFileService implements ManifestFileService {
  private readonly algorithm = 'RSA-SHA256';

  constructor(
    @Inject(CloningSigningSecret)
    private readonly cloningSigningSecret: string,
  ) {}

  performIntegrityCheck(
    manifestFilePath: string,
  ): Either<typeof integrityCheckFailed, true> {
    const childProcess = spawnSync(`sha256sum -c ${manifestFilePath}`, {
      shell: true,
    });

    const stdout = childProcess.stdout.toString();
    const stderr = childProcess.stderr.toString();
    const error = stdout.includes('FAILED') || stderr.length > 0;

    if (error) {
      return left(integrityCheckFailed);
    }

    return right(true);
  }

  async verifyManifestFileSignature(
    manifestFile: Buffer,
    signatureFile: Buffer,
  ): Promise<Either<typeof invalidSignature, true>> {
    const uploadedSignature = signatureFile.toString();

    const verifier = createVerify(this.algorithm);
    verifier.update(manifestFile);

    return verifier.verify(this.cloningSigningSecret, uploadedSignature, 'hex')
      ? right(true)
      : left(invalidSignature);
  }

  async generateManifestFileFor(
    folderPath: string,
  ): Promise<Either<typeof manifestFileGenerationError, Buffer>> {
    const childProcess = spawnSync(
      `find ${folderPath} -type f -exec sha256sum {} \\;`,
      { shell: true },
    );

    if (childProcess.error) {
      return left(manifestFileGenerationError);
    }

    return right(childProcess.stdout);
  }

  async generateSignatureFileFor(
    manifestFile: Buffer,
  ): Promise<Either<typeof signatureFileGenerationError, Buffer>> {
    try {
      const signer = createSign(this.algorithm);
      signer.update(manifestFile);
      const result = signer.sign(this.cloningSigningSecret, 'hex');

      return right(Buffer.from(result));
    } catch (err) {
      return left(signatureFileGenerationError);
    }
  }
}
