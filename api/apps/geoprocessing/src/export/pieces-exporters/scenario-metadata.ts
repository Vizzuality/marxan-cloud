import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { FileRepository } from '@marxan/files-repository';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import { PieceExportProvider, PieceProcessor } from '../pieces/piece-processor';

@Injectable()
@PieceExportProvider()
export class ScenarioMetadata extends PieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
  ) {
    super();
  }

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ScenarioMetadata;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const scenarioData: Array<{
      name: string;
    }> = await this.entityManager.query(
      `
        SELECT scenarios.name FROM scenarios WHERE scenarios.id = $1
      `,
      [input.resourceId],
    );

    if (scenarioData.length !== 1) {
      throw new Error(
        `${ScenarioMetadata.name} - Scenario ${input.resourceId} does not exist.`,
      );
    }

    const metadata = JSON.stringify({
      name: scenarioData[0].name,
    });

    const outputFile = await this.fileRepository.save(
      Readable.from(metadata),
      `json`,
    );

    if (isLeft(outputFile)) {
      throw new Error(
        `${ScenarioMetadata.name} - Scenario - couldn't save file - ${outputFile.left.description}`,
      );
    }

    return {
      ...input,
      uris: [
        {
          uri: outputFile.right,
          relativePath:
            input.resourceKind === ResourceKind.Scenario
              ? `scenario-metadata.json`
              : `scenarios/${input.resourceId}/scenario-metadata.json`,
        },
      ],
    };
  }
}
