import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Readable } from 'stream';
import { isLeft } from 'fp-ts/Either';

import { ClonePiece, JobInput, JobOutput } from '@marxan/cloning';
import { FileRepository } from '@marxan/files-repository';

import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

import { PieceExportProvider, PieceProcessor } from '../pieces/piece-processor';
import { ResourceKind } from '@marxan/cloning/domain';

@Injectable()
@PieceExportProvider()
export class ProjectConfig extends PieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
  ) {
    super();
  }

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ExportConfig;
  }

  async run(input: JobInput): Promise<JobOutput> {
    if (input.resourceKind === ResourceKind.Scenario) {
      throw new Error(`Exporting scenario is not yet supported.`);
    }

    await delay();

    const scenarios: { name: string }[] = await this.entityManager.query(
      `
       SELECT name FROM scenarios where project_id = $1
    `,
      [input.resourceId],
    );

    const metadata = JSON.stringify({
      version: `0.1.0`,
      scenarios: scenarios.map(({ name }) => name),
      kind: input.resourceKind,
      pieces: input.allPieces,
    });

    const outputFile = await this.fileRepository.save(
      Readable.from(metadata),
      `json`,
    );

    if (isLeft(outputFile)) {
      throw new Error(
        `${ProjectConfig.name} - Project - couldn't save file - ${outputFile.left.description}`,
      );
    }

    return {
      ...input,
      uris: [
        {
          uri: outputFile.right,
          relativePath: `config.json`,
        },
      ],
    };
  }
}

const delay = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
