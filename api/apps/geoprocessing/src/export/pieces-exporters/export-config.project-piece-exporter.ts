import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceRelativePaths } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ProjectExportConfigContent } from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
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
export class ExportConfigProjectPieceExporter implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return piece === ClonePiece.ExportConfig && kind === ResourceKind.Project;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const [project]: {
      name: string;
      description: string;
    }[] = await this.entityManager.query(
      `SELECT name, description FROM projects where id = $1`,
      [input.resourceId],
    );

    if (!project) {
      throw new Error(`Project with ID ${input.resourceId} not found`);
    }

    const scenarios: {
      name: string;
      id: string;
    }[] = await this.entityManager.query(
      `SELECT id, name FROM scenarios where project_id = $1`,
      [input.resourceId],
    );

    const fileContent: ProjectExportConfigContent = {
      version: `0.1.0`,
      scenarios,
      name: project.name,
      description: project.description,
      resourceKind: input.resourceKind,
      resourceId: input.resourceId,
      pieces: input.allPieces,
    };

    const outputFile = await this.fileRepository.save(
      Readable.from(JSON.stringify(fileContent)),
      `json`,
    );

    if (isLeft(outputFile)) {
      throw new Error(
        `${ExportConfigProjectPieceExporter.name} - Project - couldn't save file - ${outputFile.left.description}`,
      );
    }

    return {
      ...input,
      uris: [
        {
          uri: outputFile.right,
          relativePath: ClonePieceRelativePaths[ClonePiece.ExportConfig].config,
        },
      ],
    };
  }
}
