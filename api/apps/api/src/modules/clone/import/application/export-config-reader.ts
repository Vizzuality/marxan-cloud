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
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
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
import { Readable } from 'stream';

@Injectable()
export class ExportConfigReader {
  constructor() {}

  convertToClass(
    exportConfig: ExportConfigContent,
  ): ProjectExportConfigContent | ScenarioExportConfigContent {
    const isProjectImport = exportConfig.resourceKind === ResourceKind.Project;

    return isProjectImport
      ? plainToClass(ProjectExportConfigContent, exportConfig)
      : plainToClass(ScenarioExportConfigContent, exportConfig);
  }

  async read(
    zipReadable: Readable,
  ): Promise<Either<Failure, ExportConfigContent>> {
    const relativePath = ClonePieceRelativePathResolver.resolveFor(
      ClonePiece.ExportConfig,
    );

    const exportConfigOrError = await extractFile(zipReadable, relativePath);
    if (isLeft(exportConfigOrError)) return left(archiveCorrupted);

    try {
      const exportConfigSnapshot: ExportConfigContent = JSON.parse(
        exportConfigOrError.right,
      );

      const exportConfig = this.convertToClass(exportConfigSnapshot);

      const validationErrors = await validate(exportConfig);
      if (validationErrors.length > 0) return left(invalidFiles);

      return right(exportConfig);
    } catch (error) {
      return left(archiveCorrupted);
    }
  }
}
