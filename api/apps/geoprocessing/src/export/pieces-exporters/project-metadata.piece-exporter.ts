import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Readable } from 'stream';
import { isLeft } from 'fp-ts/Either';

import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { FileRepository } from '@marxan/files-repository';

import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

import {
  PieceExportProvider,
  ExportPieceProcessor,
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
    const projectData: Array<{
      name: string;
      description: string;
    }> = await this.entityManager.query(
      `
    SELECT projects.name, projects.description FROM projects WHERE projects.id = $1
    `,
      [input.resourceId],
    );

    if (projectData.length !== 1) {
      throw new Error(
        `${ProjectMetadataPieceExporter.name} - Project ${input.resourceId} does not exist.`,
      );
    }

    const metadata = JSON.stringify({
      name: projectData[0].name,
      description: projectData[0].description ?? null,
    });

    const outputFile = await this.fileRepository.save(
      Readable.from(metadata),
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
          relativePath: `project-metadata.json`,
        },
      ],
    };
  }
}
