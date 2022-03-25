import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ProjectMetadataContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-metadata';
import { FileRepository } from '@marxan/files-repository';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
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
export class ProjectMetadataPieceExporter implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ProjectMetadataPieceExporter.name);
  }

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.ProjectMetadata && kind === ResourceKind.Project
    );
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const projectId = input.resourceId;
    const [projectData]: {
      name: string;
      description: string;
      planning_unit_grid_shape: PlanningUnitGridShape;
    }[] = await this.entityManager
      .createQueryBuilder()
      .select(['name', 'description', 'planning_unit_grid_shape'])
      .from('projects', 'p')
      .where('id = :projectId', { projectId })
      .execute();

    if (!projectData) {
      const errorMessage = `${ProjectMetadataPieceExporter.name} - Project ${projectId} does not exist.`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const fileContent: ProjectMetadataContent = {
      name: projectData.name,
      description: projectData.description,
      planningUnitGridShape: projectData.planning_unit_grid_shape,
    };

    const outputFile = await this.fileRepository.save(
      Readable.from(JSON.stringify(fileContent)),
      `json`,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${ProjectMetadataPieceExporter.name} - Project - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: ClonePieceUrisResolver.resolveFor(
        ClonePiece.ProjectMetadata,
        outputFile.right,
      ),
    };
  }
}
