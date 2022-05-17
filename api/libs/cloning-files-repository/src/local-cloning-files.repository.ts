import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { createReadStream, existsSync, rmSync } from 'fs';
import { Readable } from 'stream';
import { ensureFolderExists, storeFile } from '../../utils/src/file-operations';
import {
  CloningFilesRepository,
  CloningStoragePath,
  fileNotFound,
  GetFileError,
  hackerFound,
  SaveFileError,
} from './cloning-files.repository';

@Injectable()
export class LocalCloningFilesStorage implements CloningFilesRepository {
  constructor(
    @Inject(CloningStoragePath) private readonly storagePath: string,
  ) {}

  private getStorageRootPath(exportId: string): string {
    return `${this.storagePath}/${exportId}`;
  }

  getFilesFolderFor(exportId: string): string {
    return `${this.getStorageRootPath(exportId)}/files`;
  }

  saveZipFile(
    exportId: string,
    stream: Readable,
  ): Promise<Either<SaveFileError, string>> {
    const path = `${this.getStorageRootPath(exportId)}/export.zip`;

    ensureFolderExists(path);

    return storeFile(path, stream);
  }

  saveCloningFile(
    exportId: string,
    stream: Readable,
    relativePath: string,
  ): Promise<Either<SaveFileError, string>> {
    const path = `${this.getFilesFolderFor(exportId)}/${relativePath}`;

    ensureFolderExists(path);

    return storeFile(path, stream);
  }

  async deleteExportFolder(exportId: string): Promise<void> {
    const path = this.getStorageRootPath(exportId);

    rmSync(path, { recursive: true, force: true });
  }

  async get(uri: string): Promise<Either<GetFileError, Readable>> {
    if (!uri.startsWith(this.storagePath)) {
      return left(hackerFound);
    }

    const fileExists = existsSync(uri);

    if (!fileExists) return left(fileNotFound);

    return right(createReadStream(uri));
  }
}
