import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ComponentLocation } from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ScenarioRunResultsContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-run-results';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

type PreviousBlmResultsSelectResult = {
  cost: number;
  blmValue: number;
  boundaryLength: number;
};
type MarxanRunSelectResult = {
  includedCount: string;
  values: boolean[];
  puid: number;
};

@Injectable()
@PieceExportProvider()
export class ScenarioRunResultsPieceExporter implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ScenarioRunResultsPieceExporter.name);
  }

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ScenarioRunResults;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const blmResults: PreviousBlmResultsSelectResult[] = await this.geoprocessingEntityManager
      .createQueryBuilder()
      .select('cost')
      .addSelect('blm_value', 'blmValue')
      .addSelect('boundary_length', 'boundaryLength')
      .from('blm_final_results', 'blm')
      .where('scenario_id = :scenarioId', { scenarioId: input.resourceId })
      .execute();

    const marxanRunSelectResult: MarxanRunSelectResult[] = await this.geoprocessingEntityManager
      .createQueryBuilder()
      .select('included_count', 'includedCount')
      .addSelect('value', 'values')
      .addSelect('ppu.puid', 'puid')
      .from(
        (qb) =>
          qb
            .select('id , project_pu_id')
            .from('scenarios_pu_data', 'inner_spd')
            .where('scenario_id = :scenarioId', {
              scenarioId: input.resourceId,
            }),
        'spd',
      )
      .innerJoin(
        'output_scenarios_pu_data',
        'results',
        'spd.id = results.scenario_pu_id',
      )
      .innerJoin('projects_pu', 'ppu', 'ppu.id = spd.project_pu_id')
      .execute();

    const marxanRunResults = marxanRunSelectResult.map((result) => ({
      ...result,
      includedCount: Number(result.includedCount),
    }));
    const content: ScenarioRunResultsContent = { blmResults, marxanRunResults };

    const relativePath = ClonePieceRelativePathResolver.resolveFor(
      ClonePiece.ScenarioRunResults,
      { kind: input.resourceKind, scenarioId: input.resourceId },
    );

    const outputFile = await this.fileRepository.saveCloningFile(
      input.exportId,
      Readable.from(JSON.stringify(content)),
      relativePath,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${ScenarioRunResultsPieceExporter.name} - Scenario Run Results - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: [new ComponentLocation(outputFile.right, relativePath)],
    };
  }
}
