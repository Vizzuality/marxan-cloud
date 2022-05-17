import { GetFileError, SaveFileError } from '@marxan/cloning-files-repository';
import { Either } from 'fp-ts/lib/Either';
import { Readable } from 'stream';

export const LegacyProjectImportStoragePath = Symbol(
  'legacy project import storage path',
);

export abstract class LegacyProjectImportFilesRepository {
  abstract get(uri: string): Promise<Either<GetFileError, Readable>>;

  abstract saveFile(
    id: string,
    stream: Readable,
    relativePath: string,
  ): Promise<Either<SaveFileError, string>>;

  abstract deleteFolder(id: string): Promise<void>;
}
