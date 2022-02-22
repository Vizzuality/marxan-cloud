import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { Either, left } from 'fp-ts/Either';

export const unknownError = Symbol(`unknown error`);
export const storageNotReachable = Symbol(`storage not reachable`);
export const fileNotFound = Symbol(`file not found`);
export const hackerFound = Symbol(`please hands off`);

export type SaveFileError =
  | typeof unknownError
  | typeof storageNotReachable
  | typeof hackerFound;

export type GetFileError =
  | typeof storageNotReachable
  | typeof fileNotFound
  | typeof hackerFound;

@Injectable()
export class FileRepository {
  async save(
    stream: Readable,
    extension?: string,
  ): Promise<Either<SaveFileError, string>> {
    return left(storageNotReachable);
  }

  async get(uri: string): Promise<Either<GetFileError, Readable>> {
    return left(storageNotReachable);
  }
}
