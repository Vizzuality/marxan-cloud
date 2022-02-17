import {
  ArchiveLocation,
  ClonePiece,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
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
  invalidFiles,
} from '../application/archive-reader.port';
import { ImportResourcePieces } from '../application/import-resource-pieces.port';
import { Import } from '../domain';

@Injectable()
export class ArchiveReaderAdapter implements ArchiveReader {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly importResourcePieces: ImportResourcePieces,
  ) {}

  async get(location: ArchiveLocation): Promise<Either<Failure, Import>> {
    const readableOrError = await this.fileRepository.get(location.value);
    if (isLeft(readableOrError)) return left(fileNotFound);

    const exportConfigOrError = await extractFile(
      readableOrError.right,
      ClonePieceRelativePaths[ClonePiece.ExportConfig].config,
    );
    if (isLeft(exportConfigOrError)) return left(archiveCorrupted);
    const exportConfig = JSON.parse(exportConfigOrError.right);

    const resourceId = ResourceId.create();
    const resourceKind = exportConfig.resourceKind;

    const validResourceKind = Object.values(ResourceKind).includes(
      resourceKind,
    );
    if (!validResourceKind) return left(invalidFiles);

    const pieces = await this.importResourcePieces.resolveFor(
      resourceId,
      resourceKind,
      location,
    );

    return right(Import.newOne(resourceId, resourceKind, location, pieces));
  }
}
