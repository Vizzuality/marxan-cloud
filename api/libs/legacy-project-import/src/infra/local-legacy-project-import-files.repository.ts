import {
  fileNotFound,
  GetFileError,
  hackerFound,
  SaveFileError,
} from '@marxan/cloning-files-repository';
import { Inject } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/lib/Either';
import { createReadStream, existsSync, rmSync } from 'fs';
import { Readable } from 'stream';
import {
  ensureFolderExists,
  storeFile,
} from '../../../utils/src/file-operations';
import {
  LegacyProjectImportFilesRepository,
  LegacyProjectImportStoragePath,
} from '../domain/legacy-project-import-files.repository';

export class LocalLegacyProjectImportFilesRepository
  implements LegacyProjectImportFilesRepository {
  constructor(
    @Inject(LegacyProjectImportStoragePath)
    private readonly storagePath: string,
  ) {}

  private getStorageRootPath(exportId: string): string {
    return `${this.storagePath}/${exportId}`;
  }

  async get(uri: string): Promise<Either<GetFileError, Readable>> {
    if (!uri.startsWith(this.storagePath)) {
      return left(hackerFound);
    }

    const fileExists = existsSync(uri);

    if (!fileExists) return left(fileNotFound);

    return right(createReadStream(uri));
  }

  async saveFile(
    id: string,
    stream: Readable,
    relativePath: string,
  ): Promise<Either<SaveFileError, string>> {
    const path = `${this.getStorageRootPath(id)}/${relativePath}`;

    ensureFolderExists(path);

    return storeFile(path, stream);
  }

  async deleteFolder(id: string): Promise<void> {
    const path = this.getStorageRootPath(id);

    rmSync(path, { recursive: true, force: true });
  }
}
