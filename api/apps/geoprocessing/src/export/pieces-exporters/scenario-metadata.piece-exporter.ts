import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ScenarioMetadataContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-metadata';
import { FileRepository } from '@marxan/files-repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

interface SelectScenarioResult {
  name: string;
  description?: string;
  blm?: number;
  number_of_runs?: number;
  metadata?: Scenario['metadata'];
}

@Injectable()
@PieceExportProvider()
export class ScenarioMetadataPieceExporter implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ScenarioMetadataPieceExporter.name);
  }

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ScenarioMetadata;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const [scenario]: [
      SelectScenarioResult,
    ] = await this.entityManager
      .createQueryBuilder()
      .select('name, description, blm, number_of_runs, metadata')
      .from('scenarios', 's')
      .where('s.id = :scenarioId', { scenarioId: input.resourceId })
      .execute();

    if (!scenario) {
      const errorMessage = `${ScenarioMetadataPieceExporter.name} - Scenario ${input.resourceId} does not exist.`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const fileContent: ScenarioMetadataContent = {
      blm: scenario.blm,
      description: scenario.description,
      metadata: scenario.metadata,
      name: scenario.name,
      numberOfRuns: scenario.number_of_runs,
    };

    const outputFile = await this.fileRepository.save(
      Readable.from(JSON.stringify(fileContent)),
      `json`,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${ScenarioMetadataPieceExporter.name} - Scenario - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: ClonePieceUrisResolver.resolveFor(
        ClonePiece.ScenarioMetadata,
        outputFile.right,
        {
          kind: input.resourceKind,
          scenarioId: input.resourceId,
        },
      ),
    };
  }
}
