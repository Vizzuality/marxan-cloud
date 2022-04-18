import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { createReadStream, createWriteStream } from 'fs';
import { Readable } from 'stream';
import { v4 } from 'uuid';
import {
  CloningStoragePath,
  FileRepository,
  GetFileError,
  hackerFound,
  SaveFileError,
  unknownError,
} from './file.repository';

@Injectable()
export class TempStorageRepository implements FileRepository {
  constructor(
    @Inject(CloningStoragePath) private readonly storagePath: string,
  ) {}

  async get(uri: string): Promise<Either<GetFileError, Readable>> {
    if (!uri.startsWith(this.storagePath)) {
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
    const path = this.storagePath + `/` + name;
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
