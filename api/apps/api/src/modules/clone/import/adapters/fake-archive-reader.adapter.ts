import {
  ArchiveLocation,
  ClonePiece,
  ComponentLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { FileRepository } from '@marxan/files-repository';
import { Injectable } from '@nestjs/common';
import { Either, isLeft, right, left } from 'fp-ts/lib/Either';
import { ArchiveReader, Failure } from '../application/archive-reader.port';
import { Import, ImportComponent } from '../domain';
import { notFound } from '@marxan/files-repository/file.repository';

@Injectable()
export class FakeArchiveReader implements ArchiveReader {
  constructor(private readonly fileRepository: FileRepository) {}

  async get(archive: ArchiveLocation): Promise<Either<Failure, Import>> {
    const result = await this.fileRepository.get(archive.value);

    if (isLeft(result)) return left(notFound);

    const readable = result.right;

    const resourceId = ResourceId.create();
    const resourceKind = ResourceKind.Project;

    return right(
      Import.newOne(resourceId, resourceKind, archive, [
        ImportComponent.newOne(resourceId, ClonePiece.ProjectMetadata, 0, [
          new ComponentLocation(archive.value, `project-metadata.json`),
        ]),
      ]),
    );
  }
}
