import { GetFileError, SaveFileError } from '@marxan/cloning-files-repository';
import { ArchiveLocation } from '@marxan/cloning/domain';
import { Either } from 'fp-ts/Either';
import { ExportId } from '../domain';
import { FileDestination } from './archive-creator.port';

export const integrityCheckFailed = Symbol('integrity check failed');
export const invalidSignature = Symbol('invalid signature');
export const manifestFileGenerationError = Symbol(
  'manifest file generation error',
);
export const signatureFileGenerationError = Symbol(
  'signature file generation error',
);

export const ManifestFilePrivateKey = Symbol('manifest file private key');

export abstract class ManifestFileService {
  abstract performIntegrityCheck(
    exportId: ExportId,
  ): Either<typeof integrityCheckFailed, true>;

  abstract verifyManifestFileSignature(
    manifestFileUri: string,
  ): Promise<Either<typeof invalidSignature, true>>;

  abstract generateManifestFileFor(
    exportId: ExportId,
  ): Promise<
    Either<typeof manifestFileGenerationError | SaveFileError, FileDestination>
  >;

  abstract generateSignatureFileFor(
    exportId: ExportId,
    manifestFileUri: string,
  ): Promise<
    Either<
      typeof signatureFileGenerationError | SaveFileError | GetFileError,
      FileDestination
    >
  >;
}
