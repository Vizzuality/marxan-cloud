import { Either, left, right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import {
  fileNotFound,
  GetFileError,
  SaveFileError,
} from '../../../cloning-files-repository/src';
import { unknownError } from '../../../utils/src/file-operations';
import { LegacyProjectImportFilesRepository } from '../domain';

export class LegacyProjectImportFilesMemoryRepository
  implements LegacyProjectImportFilesRepository {
  private files: Record<string, Readable> = {};
  public saveFailure = false;

  getPathFor(id: string, relativePath: string): string {
    return `${id}/${relativePath}`;
  }

  async get(uri: string): Promise<Either<GetFileError, Readable>> {
    const file = this.files[uri];

    if (!file) return left(fileNotFound);

    return right(file);
  }

  async saveFile(
    id: string,
    stream: Readable,
    relativePath: string,
  ): Promise<Either<SaveFileError, string>> {
    if (this.saveFailure) return left(unknownError);

    const path = this.getPathFor(id, relativePath);

    this.files[path] = stream;

    return right(path);
  }

  async deleteFolder(id: string): Promise<void> {
    const filePaths = Object.keys(this.files).filter((path) =>
      path.startsWith(id),
    );

    filePaths.forEach((path) => {
      delete this.files[path];
    });
  }

  async deleteFile(path: string): Promise<void> {
    delete this.files[path];
  }
}
