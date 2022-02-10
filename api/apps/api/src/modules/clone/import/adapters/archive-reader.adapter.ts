import {
  ArchiveLocation,
  ClonePiece,
  ComponentLocation,
  ResourceId,
} from '@marxan/cloning/domain';
import {
  ExportConfigContent,
  ExportConfigRelativePath,
} from '@marxan/cloning/infraestructure/clone-piece-data/export-config';
import { FileRepository } from '@marxan/files-repository';
import { notFound } from '@marxan/files-repository/file.repository';
import { Injectable } from '@nestjs/common';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import * as unzipper from 'unzipper';
import {
  ArchiveReader,
  Failure,
  invalidFiles,
} from '../application/archive-reader.port';
import { Import, ImportComponent } from '../domain';

export const exportConfigFileParsingFailed = Symbol(
  'export config file parsing failed',
);

@Injectable()
export class ArchiveReaderAdapter implements ArchiveReader {
  constructor(private readonly fileRepository: FileRepository) {}

  private parseExportConfigFile(
    readable: Readable,
  ): Promise<
    Either<typeof exportConfigFileParsingFailed, ExportConfigContent>
  > {
    return new Promise<
      Either<typeof exportConfigFileParsingFailed, ExportConfigContent>
    >((resolve) => {
      readable
        .pipe(unzipper.ParseOne(new RegExp(ExportConfigRelativePath)))
        .on('entry', async (entry: unzipper.Entry) => {
          const buffer = await entry.buffer();
          resolve(right(JSON.parse(buffer.toString())));
        })
        .on('error', () => {
          resolve(left(exportConfigFileParsingFailed));
        });
    });
  }

  async get(archive: ArchiveLocation): Promise<Either<Failure, Import>> {
    const readableOrError = await this.fileRepository.get(archive.value);
    if (isLeft(readableOrError)) return left(notFound);

    const exportConfigOrError = await this.parseExportConfigFile(
      readableOrError.right,
    );
    if (isLeft(exportConfigOrError)) return left(invalidFiles);
    const exportConfig = exportConfigOrError.right;

    // TODO We should validate resourceId and resourceKind
    const resourceId = new ResourceId(exportConfig.resourceId);
    const resourceKind = exportConfig.resourceKind;

    // TODO We should generate proper import pieces
    return right(
      Import.newOne(resourceId, resourceKind, archive, [
        ImportComponent.newOne(resourceId, ClonePiece.ProjectMetadata, 0, [
          new ComponentLocation(archive.value, `project-metadata.json`),
        ]),
      ]),
    );
  }
}
