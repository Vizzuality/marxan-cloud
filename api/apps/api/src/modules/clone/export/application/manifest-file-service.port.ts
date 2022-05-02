import { Either } from 'fp-ts/Either';

export const integrityCheckFailed = Symbol('integrity check failed');
export const invalidSignature = Symbol('invalid signature');
export const manifestFileGenerationError = Symbol(
  'manifest file generation error',
);
export const signatureFileGenerationError = Symbol(
  'signature file generation error',
);

export const CloningSigningSecret = Symbol('cloning signing secret');

export abstract class ManifestFileService {
  abstract performIntegrityCheck(
    manifestFilePath: string,
  ): Either<typeof integrityCheckFailed, true>;

  abstract verifyManifestFileSignature(
    manifestFile: Buffer,
    signatureFile: Buffer,
  ): Promise<Either<typeof invalidSignature, true>>;

  abstract generateManifestFileFor(
    folderPath: string,
  ): Promise<Either<typeof manifestFileGenerationError, Buffer>>;

  abstract generateSignatureFileFor(
    manifestFile: Buffer,
  ): Promise<Either<typeof signatureFileGenerationError, Buffer>>;
}
