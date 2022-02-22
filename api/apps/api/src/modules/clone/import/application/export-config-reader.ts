import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import {
  archiveCorrupted,
  ArchiveReader,
  Failure,
  invalidFiles,
} from '@marxan/cloning/infrastructure/archive-reader.port';
import { ClonePieceRelativePaths } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  ExportConfigContent,
  ProjectExportConfigContent,
  ScenarioExportConfigContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { extractFile } from '@marxan/utils';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';

@Injectable()
export class ExportConfigReader {
  constructor(private readonly archiveReader: ArchiveReader) {}

  convertToClass(
    exportConfig: ExportConfigContent,
  ): ProjectExportConfigContent | ScenarioExportConfigContent {
    const isProjectImport = exportConfig.resourceKind === ResourceKind.Project;

    return isProjectImport
      ? plainToClass(ProjectExportConfigContent, exportConfig)
      : plainToClass(ScenarioExportConfigContent, exportConfig);
  }

  async read(
    archiveLocation: ArchiveLocation,
  ): Promise<Either<Failure, ExportConfigContent>> {
    const readableOrError = await this.archiveReader.get(archiveLocation);
    if (isLeft(readableOrError)) return readableOrError;

    const exportConfigOrError = await extractFile(
      readableOrError.right,
      ClonePieceRelativePaths[ClonePiece.ExportConfig].config,
    );
    if (isLeft(exportConfigOrError)) return left(archiveCorrupted);

    const exportConfigSnapshot: ExportConfigContent = JSON.parse(
      exportConfigOrError.right,
    );

    const exportConfig = this.convertToClass(exportConfigSnapshot);

    const validationErrors = await validate(exportConfig);
    if (validationErrors.length > 0) return left(invalidFiles);

    return right(exportConfig);
  }
}
