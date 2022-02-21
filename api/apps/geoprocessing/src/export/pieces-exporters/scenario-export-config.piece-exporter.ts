import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceRelativePaths } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ScenarioExportConfigContent } from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
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
export class ScenarioExportConfigPieceExporter implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return piece === ClonePiece.ExportConfig && kind === ResourceKind.Scenario;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
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
        `${ScenarioExportConfigPieceExporter.name} - Scenario - couldn't save file - ${outputFile.left.description}`,
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
