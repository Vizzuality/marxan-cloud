import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import {
  getScenarioMetadataRelativePath,
  ScenarioMetadataContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/scenario-metadata';
import { FileRepository } from '@marxan/files-repository';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import {
  PieceExportProvider,
  ExportPieceProcessor,
} from '../pieces/export-piece-processor';

@Injectable()
@PieceExportProvider()
export class ScenarioMetadataPieceExporter implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ScenarioMetadata;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const [scenario]: [
      {
        name: string;
        description?: string;
      },
    ] = await this.entityManager.query(
      `
        SELECT name, description FROM scenarios WHERE scenarios.id = $1
      `,
      [input.resourceId],
    );

    if (!scenario) {
      throw new Error(
        `${ScenarioMetadataPieceExporter.name} - Scenario ${input.resourceId} does not exist.`,
      );
    }

    const fileContent: ScenarioMetadataContent = {
      description: scenario.description,
      name: scenario.name,
    };

    const outputFile = await this.fileRepository.save(
      Readable.from(JSON.stringify(fileContent)),
      `json`,
    );

    if (isLeft(outputFile)) {
      throw new Error(
        `${ScenarioMetadataPieceExporter.name} - Scenario - couldn't save file - ${outputFile.left.description}`,
      );
    }

    return {
      ...input,
      uris: [
        {
          uri: outputFile.right,
          relativePath: getScenarioMetadataRelativePath(
            input.resourceKind,
            input.resourceId,
          ),
        },
      ],
    };
  }
}
