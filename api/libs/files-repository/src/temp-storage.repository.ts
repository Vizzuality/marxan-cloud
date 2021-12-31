import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { Either, left, right } from 'fp-ts/Either';
import { createReadStream, createWriteStream } from 'fs';
import { ConfigService } from '@nestjs/config';

import {
  FileRepository,
  GetFileError,
  hackerFound,
  SaveFileError,
  unknownError,
} from './file.repository';
import { FileRepoConfig } from './file-repo.config';
import { v4 } from 'uuid';

@Injectable()
export class TempStorageRepository implements FileRepository {
  readonly #storage: string;

  constructor(readonly config: ConfigService<FileRepoConfig, true>) {
    this.#storage = config.get('API_SHARED_FILE_STORAGE_LOCAL_PATH');
  }

  async get(uri: string): Promise<Either<GetFileError, Readable>> {
    if (!uri.startsWith(this.#storage)) {
      return left(hackerFound);
    }

    // as it is mainly temporary/dev module, we can live with not ideal
    // error handling
    return right(createReadStream(uri));
  }

  async save(
    stream: Readable,
    extension?: string,
  ): Promise<Either<SaveFileError, string>> {
    const name = v4() + `${extension ? `.${extension}` : ''}`;
    const path = this.#storage + `/` + name;
    const writer = createWriteStream(path);

    return new Promise((resolve) => {
      writer.on('close', () => {
        // do nothing
      });
      writer.on(`finish`, () => {
        resolve(right(path));
      });
      writer.on('error', (error) => {
        console.error(error);
        resolve(left(unknownError));
      });

      // as it is mainly temporary/dev module, we can live with not ideal
      // error handling;
      stream.pipe(writer);
    });
  }
}
