import { JSONValue } from '@marxan-api/utils/json.type';
import { ArchiveLocation, ClonePiece } from '@marxan/cloning/domain';
import { ClonePieceRelativePaths } from '@marxan/cloning/infrastructure/clone-piece-data';
import { FileRepository } from '@marxan/files-repository';
import { fileNotFound } from '@marxan/files-repository/file.repository';
import { extractFile } from '@marxan/utils';
import { Injectable } from '@nestjs/common';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import {
  archiveCorrupted,
  ArchiveReader,
  Failure,
} from '../application/archive-reader.port';

@Injectable()
export class ArchiveReaderAdapter implements ArchiveReader {
  constructor(private readonly fileRepository: FileRepository) {}

  async get(location: ArchiveLocation): Promise<Either<Failure, JSONValue>> {
    const readableOrError = await this.fileRepository.get(location.value);
    if (isLeft(readableOrError)) return left(fileNotFound);

    const exportConfigOrError = await extractFile(
      readableOrError.right,
      ClonePieceRelativePaths[ClonePiece.ExportConfig].config,
    );
    if (isLeft(exportConfigOrError)) return left(archiveCorrupted);
    return JSON.parse(exportConfigOrError.right);
  }
}
