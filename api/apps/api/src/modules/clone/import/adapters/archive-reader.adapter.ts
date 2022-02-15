import {
  ArchiveLocation,
  ClonePiece,
  ResourceId,
} from '@marxan/cloning/domain';
import { ClonePieceRelativePaths } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ExportConfigContent } from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { FileRepository } from '@marxan/files-repository';
import { fileNotFound } from '@marxan/files-repository/file.repository';
import { Injectable } from '@nestjs/common';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import * as unzipper from 'unzipper';
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

  private parseExportConfigFile(
    readable: Readable,
  ): Promise<Either<typeof archiveCorrupted, ExportConfigContent>> {
    return new Promise<Either<typeof archiveCorrupted, ExportConfigContent>>(
      (resolve) => {
        readable
          .pipe(
            unzipper.ParseOne(
              new RegExp(
                ClonePieceRelativePaths[ClonePiece.ExportConfig].config,
              ),
            ),
          )
          .on('entry', async (entry: unzipper.Entry) => {
            const buffer = await entry.buffer();
            resolve(right(JSON.parse(buffer.toString())));
          })
          .on('error', () => {
            resolve(left(archiveCorrupted));
          });
      },
    );
  }

  async get(location: ArchiveLocation): Promise<Either<Failure, Import>> {
    const readableOrError = await this.fileRepository.get(location.value);
    if (isLeft(readableOrError)) return left(fileNotFound);

    const exportConfigOrError = await this.parseExportConfigFile(
      readableOrError.right,
    );
    if (isLeft(exportConfigOrError)) return left(invalidFiles);
    const exportConfig = exportConfigOrError.right;

    // TODO We should validate resourceId and resourceKind
    const resourceId = new ResourceId(exportConfig.resourceId);
    const resourceKind = exportConfig.resourceKind;

    const pieces = await this.importResourcePieces.resolveFor(
      resourceId,
      resourceKind,
      location,
    );

    return right(Import.newOne(resourceId, resourceKind, location, pieces));
  }
}
