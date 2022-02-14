import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Readable } from 'stream';
import { isLeft } from 'fp-ts/Either';

import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { FileRepository } from '@marxan/files-repository';

import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

import { PieceExportProvider, PieceProcessor } from '../pieces/piece-processor';
import { ResourceKind } from '@marxan/cloning/domain';

@Injectable()
@PieceExportProvider()
export class ExportConfig extends PieceProcessor {
  private readonly relativePath = 'config.json';

  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
  ) {
    super();
  }

  private async projectExportConfig(
    input: ExportJobInput,
  ): Promise<ExportJobOutput> {
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
        `${ExportConfig.name} - Project - couldn't save file - ${outputFile.left.description}`,
      );
    }

    return {
      ...input,
      uris: [
        {
          uri: outputFile.right,
          relativePath: this.relativePath,
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

    const metadata = JSON.stringify({
      version: `0.1.0`,
      name: scenario.name,
      description: scenario.description,
      projectId: scenario.project_id,
      kind: input.resourceKind,
      pieces: input.allPieces,
    });

    const outputFile = await this.fileRepository.save(
      Readable.from(metadata),
      `json`,
    );

    if (isLeft(outputFile)) {
      throw new Error(
        `${ExportConfig.name} - Scenario - couldn't save file - ${outputFile.left.description}`,
      );
    }

    return {
      ...input,
      uris: [
        {
          uri: outputFile.right,
          relativePath: this.relativePath,
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
