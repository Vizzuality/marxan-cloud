import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
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

export const zipFileDoesNotContainsExportConfig = Symbol(
  "zip file doesn't contain export config",
);
export const invalidExportConfigFile = Symbol('invalid export config file');

export type ExportConfigReaderError =
  | typeof invalidExportConfigFile
  | typeof zipFileDoesNotContainsExportConfig;

@Injectable()
export class ExportConfigReader {
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
  ): Promise<Either<ExportConfigReaderError, ExportConfigContent>> {
    const relativePath = ClonePieceRelativePathResolver.resolveFor(
      ClonePiece.ExportConfig,
    );

    const exportConfigOrError = await extractFile(zipReadable, relativePath);
    if (isLeft(exportConfigOrError))
      return left(zipFileDoesNotContainsExportConfig);

    try {
      const exportConfigSnapshot: ExportConfigContent = JSON.parse(
        exportConfigOrError.right,
      );

      const exportConfig = this.convertToClass(exportConfigSnapshot);

      const validationErrors = await validate(exportConfig);
      if (validationErrors.length > 0) return left(invalidExportConfigFile);

      return right(exportConfig);
    } catch (error) {
      return left(zipFileDoesNotContainsExportConfig);
    }
  }
}
