import { Injectable } from '@nestjs/common';
import {
  ArtifactType,
  ProjectTemplateFileRepository,
} from '@marxan/project-template-file';
import * as archiver from 'archiver';
import * as stream from 'stream';

@Injectable()
export class Storage {
  constructor(
    private readonly projectFilesRepository: ProjectTemplateFileRepository,
  ) {}

  async save(projectId: string, shapefileDirectory: string) {
    const shapefileArchive = new ZipArchive();
    const savePromise = this.projectFilesRepository.save(
      {
        contentType: `application/zip`,
        projectId,
        artifactType: ArtifactType.CostTemplate,
      },
      shapefileArchive.stream(),
    );
    shapefileArchive.addDirectoryAsZipRoot(shapefileDirectory);
    await shapefileArchive.finalize();
    await savePromise;
  }
}

class ZipArchive {
  private readonly archive: archiver.Archiver;

  constructor() {
    this.archive = archiver(`zip`);
  }

  stream(): stream.Transform {
    return this.archive;
  }

  addDirectoryAsZipRoot(directoryPath: string): void {
    this.archive.directory(directoryPath, false);
  }

  finalize(): Promise<void> {
    return this.archive.finalize();
  }
}
