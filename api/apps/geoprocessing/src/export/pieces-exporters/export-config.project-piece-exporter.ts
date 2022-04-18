import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  exportVersion,
  ProjectExportConfigContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { Injectable, Logger } from '@nestjs/common';
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
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ExportConfigProjectPieceExporter.name);
  }

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return piece === ClonePiece.ExportConfig && kind === ResourceKind.Project;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const projectId = input.resourceId;
    const [project]: {
      name: string;
      description?: string;
    }[] = await this.entityManager
      .createQueryBuilder()
      .select('name')
      .addSelect('description')
      .from('projects', 'p')
      .where('id = :projectId', { projectId })
      .execute();

    if (!project) {
      const errorMessage = `Project with ID ${projectId} not found`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const scenarios: {
      name: string;
      id: string;
    }[] = await this.entityManager
      .createQueryBuilder()
      .select('id')
      .addSelect('name')
      .from('scenarios', 's')
      .where('project_id = :projectId', { projectId })
      .execute();

    const projectPieces = input.allPieces
      .filter(({ resourceId }) => resourceId === projectId)
      .map(({ piece }) => piece);

    const scenarioPieces: Record<string, ClonePiece[]> = {};
    scenarios.forEach(({ id }) => {
      scenarioPieces[id] = [];
    });
    input.allPieces
      .filter(({ resourceId }) => resourceId !== projectId)
      .forEach(({ piece, resourceId }) => {
        scenarioPieces[resourceId].push(piece);
      });

    const fileContent: ProjectExportConfigContent = {
      version: exportVersion,
      scenarios,
      name: project.name,
      description: project.description,
      resourceKind: input.resourceKind,
      resourceId: projectId,
      isCloning: input.isCloning,
      pieces: {
        project: projectPieces,
        scenarios: scenarioPieces,
      },
    };

    const outputFile = await this.fileRepository.save(
      Readable.from(JSON.stringify(fileContent)),
      `json`,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${ExportConfigProjectPieceExporter.name} - Project - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: ClonePieceUrisResolver.resolveFor(
        ClonePiece.ExportConfig,
        outputFile.right,
      ),
    };
  }
}
