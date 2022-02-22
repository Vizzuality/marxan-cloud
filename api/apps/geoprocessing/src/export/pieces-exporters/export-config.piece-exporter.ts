import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
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
import {
  ProjectExportConfigContent,
  ScenarioExportConfigContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { ClonePieceRelativePaths } from '@marxan/cloning/infrastructure/clone-piece-data';

@Injectable()
@PieceExportProvider()
export class ExportConfigPieceExporter implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
  ) {}

  private async projectExportConfig(
    input: ExportJobInput,
  ): Promise<ExportJobOutput> {
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
        `${ExportConfigPieceExporter.name} - Project - couldn't save file - ${outputFile.left.description}`,
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

  private async scenarioExportConfig(
    input: ExportJobInput,
  ): Promise<ExportJobOutput> {
    const [scenario]: {
      name: string;
      project_id: string;
      description: string;
    }[] = await this.entityManager.query(
      `
       SELECT name, project_id, description FROM scenarios where id = $1
    `,
      [input.resourceId],
    );

    if (!scenario) {
      throw new Error(`Scenario with ID ${input.resourceId} not found`);
    }

    const fileContent: ScenarioExportConfigContent = {
      version: `0.1.0`,
      name: scenario.name,
      description: scenario.description,
      projectId: scenario.project_id,
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
        `${ExportConfigPieceExporter.name} - Scenario - couldn't save file - ${outputFile.left.description}`,
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

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ExportConfig;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    if (input.resourceKind === ResourceKind.Scenario) {
      return this.scenarioExportConfig(input);
    }

    if (input.resourceKind === ResourceKind.Project) {
      return this.projectExportConfig(input);
    }

    throw new Error(`Unknown resource kind: ${input.resourceKind}`);
  }
}
