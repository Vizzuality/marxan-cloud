import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import {
  ProjectMetadataContent,
  ProjectMetadataRelativePath,
} from '@marxan/cloning/infrastructure/clone-piece-data/project-metadata';
import { FileRepository } from '@marxan/files-repository';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

@Injectable()
@PieceExportProvider()
export class ProjectMetadataPieceExporter implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ProjectMetadata;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const [projectData]: {
      name: string;
      description: string;
    }[] = await this.entityManager.query(
      `SELECT projects.name, projects.description FROM projects WHERE projects.id = $1`,
      [input.resourceId],
    );

    if (!projectData) {
      throw new Error(
        `${ProjectMetadataPieceExporter.name} - Project ${input.resourceId} does not exist.`,
      );
    }

    const fileContent: ProjectMetadataContent = {
      name: projectData.name,
      description: projectData.description,
    };

    const outputFile = await this.fileRepository.save(
      Readable.from(JSON.stringify(fileContent)),
      `json`,
    );

    if (isLeft(outputFile)) {
      throw new Error(
        `${ProjectMetadataPieceExporter.name} - Project - couldn't save file - ${outputFile.left.description}`,
      );
    }

    return {
      ...input,
      uris: [
        {
          uri: outputFile.right,
          relativePath: ProjectMetadataRelativePath,
        },
      ],
    };
  }
}
