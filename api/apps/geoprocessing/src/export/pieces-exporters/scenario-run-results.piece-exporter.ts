import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ScenarioRunResultsContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-run-results';
import { FileRepository } from '@marxan/files-repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

interface PreviousBlmResultsSelectResult {
  cost: number;
  blmValue: number;
  boundaryLength: number;
}
interface MarxanRunSelectResult {
  includedCount: number;
  value: boolean[];
  puid: number;
}

@Injectable()
@PieceExportProvider()
export class ScenarioRunResultsPieceExporter implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ScenarioRunResultsPieceExporter.name);
  }

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
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

    const marxanRunResults: MarxanRunSelectResult[] = await this.geoprocessingEntityManager
      .createQueryBuilder()
      .select('included_count', 'includedCount')
      .addSelect('value')
      .addSelect('ppu.puid', 'puid')
      .from('output_scenarios_pu_data', 'results')
      .innerJoin('scenarios_pu_data', 'spd', 'spd.id = results.scenario_pu_id')
      .innerJoin('projects_pu', 'ppu', 'ppu.id = spd.project_pu_id')
      .execute();

    const content: ScenarioRunResultsContent = { blmResults, marxanRunResults };

    const outputFile = await this.fileRepository.save(
      Readable.from(JSON.stringify(content)),
      `json`,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${ScenarioRunResultsPieceExporter.name} - Scenario Run Results - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: ClonePieceUrisResolver.resolveFor(
        ClonePiece.ScenarioRunResults,
        outputFile.right,
        { kind: ResourceKind.Project, scenarioId: input.resourceId },
      ),
    };
  }
}
