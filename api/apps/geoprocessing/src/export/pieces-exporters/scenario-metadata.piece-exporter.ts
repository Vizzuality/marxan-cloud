import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ComponentLocation } from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ScenarioMetadataContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-metadata';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

type SelectScenarioResult = {
  name: string;
  description?: string;
  blm?: number;
  number_of_runs?: number;
  metadata?: ScenarioMetadataContent['metadata'];
  ran_at_least_once: boolean;
  solutions_are_locked: boolean;
  status: ScenarioMetadataContent['status'] | null;
  type: string;
  cost_surface_id: string;
};

type SelectScenarioBlmResult = {
  defaults: number[];
  values: number[];
  range: number[];
};

@Injectable()
@PieceExportProvider()
export class ScenarioMetadataPieceExporter implements ExportPieceProcessor {
  private readonly logger: Logger = new Logger(
    ScenarioMetadataPieceExporter.name,
  );

  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ScenarioMetadata;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const scenarioId = input.resourceId;

    const [scenario]: [
      SelectScenarioResult,
    ] = await this.entityManager
      .createQueryBuilder()
      .select([
        'name',
        'description',
        'blm',
        'number_of_runs',
        'metadata',
        'type',
        'status',
        'ran_at_least_once',
        'solutions_are_locked',
      ])
      .from('scenarios', 's')
      .where('s.id = :scenarioId', { scenarioId })
      .execute();

    if (!scenario) {
      const errorMessage = `${ScenarioMetadataPieceExporter.name} - Scenario ${scenarioId} does not exist.`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const [blmRange]: [
      SelectScenarioBlmResult,
    ] = await this.entityManager
      .createQueryBuilder()
      .select(['values', 'defaults', 'range'])
      .from('scenario_blms', 'pblms')
      .where('id = :scenarioId', { scenarioId })
      .execute();

    if (!blmRange) {
      const errorMessage = `${ScenarioMetadataPieceExporter.name} - Blm for scenario with id ${scenarioId} does not exist.`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const fileContent: ScenarioMetadataContent = {
      blm: scenario.blm,
      description: scenario.description,
      metadata: scenario.metadata,
      name: scenario.name,
      numberOfRuns: scenario.number_of_runs,
      blmRange,
      ranAtLeastOnce: scenario.ran_at_least_once,
      solutionsAreLocked: scenario.solutions_are_locked,
      type: scenario.type,
      status: scenario.status ?? undefined,
      cost_surface_id: scenario.cost_surface_id,
    };

    const relativePath = ClonePieceRelativePathResolver.resolveFor(
      ClonePiece.ScenarioMetadata,
      {
        kind: input.resourceKind,
        scenarioId: input.resourceId,
      },
    );

    const outputFile = await this.fileRepository.saveCloningFile(
      input.exportId,
      Readable.from(JSON.stringify(fileContent)),
      relativePath,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${ScenarioMetadataPieceExporter.name} - Scenario - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: [new ComponentLocation(outputFile.right, relativePath)],
    };
  }
}
