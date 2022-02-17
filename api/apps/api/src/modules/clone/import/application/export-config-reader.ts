import { JSONObject, JSONValue } from '@marxan-api/utils/json.type';
import { ArchiveLocation, ClonePiece } from '@marxan/cloning/domain';
import { checkIsResourceKind } from '@marxan/cloning/domain/resource.kind';
import {
  archiveCorrupted,
  ArchiveReader,
  Failure,
  invalidFiles,
} from '@marxan/cloning/infrastructure/archive-reader.port';
import { ClonePieceRelativePaths } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ExportConfigContent } from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { extractFile } from '@marxan/utils';
import { Injectable } from '@nestjs/common';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';

@Injectable()
export class ExportConfigReader {
  constructor(private readonly archiveReader: ArchiveReader) {}

  async read(
    archiveLocation: ArchiveLocation,
  ): Promise<Either<Failure, ExportConfigContent>> {
    const readableOrError = await this.archiveReader.get(archiveLocation);
    if (isLeft(readableOrError)) return readableOrError;

    const exportConfigOrError = await extractFile(
      readableOrError.right,
      new RegExp(ClonePieceRelativePaths[ClonePiece.ExportConfig].config),
    );
    if (isLeft(exportConfigOrError)) return left(archiveCorrupted);

    const exportConfig = JSON.parse(exportConfigOrError.right);

    const resourceKind = (exportConfig as JSONObject).resourceKind;

    if (!checkIsResourceKind(resourceKind)) return left(invalidFiles);

    return right(exportConfig);
  }
}
