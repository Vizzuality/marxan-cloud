import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Readable } from 'stream';
import { isLeft } from 'fp-ts/Either';

import { ClonePiece, JobInput, JobOutput } from '@marxan/cloning';
import { FileRepository } from '@marxan/files-repository';

import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

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

  async run(input: JobInput): Promise<JobOutput> {
    console.log('hey');

    const scenarioData: Array<{
      name: string;
      description: string;
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
          relativePath: `scenario-metadata.json`,
        },
      ],
    };
  }
}
