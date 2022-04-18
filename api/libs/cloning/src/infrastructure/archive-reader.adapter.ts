import {
  CloningFilesRepository,
  fileNotFound,
} from '@marxan/cloning-files-repository';
import { Injectable } from '@nestjs/common';
import { Either, isLeft, left } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { ArchiveLocation } from '../domain/archive-location';
import { ArchiveReader, Failure } from './archive-reader.port';

@Injectable()
export class ArchiveReaderAdapter implements ArchiveReader {
  constructor(private readonly fileRepository: CloningFilesRepository) {}

  async get(location: ArchiveLocation): Promise<Either<Failure, Readable>> {
    const readableOrError = await this.fileRepository.get(location.value);
    if (isLeft(readableOrError)) return left(fileNotFound);
    return readableOrError;
  }
}
