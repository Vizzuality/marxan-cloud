import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  rmSync,
} from 'fs';
import { dirname } from 'path';
import { Readable } from 'stream';
import {
  CloningFilesRepository,
  CloningStoragePath,
  fileNotFound,
  GetFileError,
  hackerFound,
  SaveFileError,
  unknownError,
} from './cloning-files.repository';

@Injectable()
export class LocalCloningFilesStorage implements CloningFilesRepository {
  constructor(
    @Inject(CloningStoragePath) private readonly storagePath: string,
  ) {}

  private ensureFolderExists(path: string): void {
    const directory = dirname(path);
    const directoryExists = existsSync(directory);

    if (!directoryExists) {
      mkdirSync(directory, { recursive: true });
    }
  }

  private async saveFile(
    path: string,
    stream: Readable,
  ): Promise<Either<SaveFileError, string>> {
    const writer = createWriteStream(path);

    return new Promise((resolve) => {
      writer.on('close', () => {});
      writer.on(`finish`, () => {
        resolve(right(path));
      });
      writer.on('error', (error) => {
        console.error(error);
        resolve(left(unknownError));
      });

      stream.pipe(writer);
    });
  }

  saveZipFile(
    exportId: string,
    stream: Readable,
  ): Promise<Either<SaveFileError, string>> {
    const path = `${this.storagePath}/${exportId}/export.zip`;

    this.ensureFolderExists(path);

    return this.saveFile(path, stream);
  }

  saveCloningFile(
    exportId: string,
    stream: Readable,
    relativePath: string,
  ): Promise<Either<SaveFileError, string>> {
    const path = `${this.storagePath}/${exportId}/files/${relativePath}`;

    this.ensureFolderExists(path);

    return this.saveFile(path, stream);
  }

  async deleteExportFolder(exportId: string): Promise<void> {
    const path = `${exportId}`;

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
