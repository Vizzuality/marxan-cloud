import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { BlmFinalResultEntity } from '@marxan/blm-calibration';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import {
  BlmResultsContent,
  MarxanRunResultsContent,
  ScenarioRunResultsContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/scenario-run-results';
import { FileRepository } from '@marxan/files-repository';
import { OutputScenariosPuDataGeoEntity } from '@marxan/marxan-output';
import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { extractFile } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import {
  ImportPieceProcessor,
  PieceImportProvider,
} from '../pieces/import-piece-processor';

interface ProjectsPuSelectResult {
  scenarioPuId: string;
  puid: number;
}

@Injectable()
@PieceImportProvider()
export class ScenarioRunResultsPieceImporter implements ImportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ScenarioRunResultsPieceImporter.name);
  }

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return piece === ClonePiece.ScenarioRunResults;
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const { uris, projectId, piece, pieceResourceId: scenarioId } = input;
    if (uris.length !== 1) {
      const errorMessage = `uris array has an unexpected amount of elements: ${uris.length}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    const [scenarioRunResultsLocation] = uris;

    const readableOrError = await this.fileRepository.get(
      scenarioRunResultsLocation.uri,
    );
    if (isLeft(readableOrError)) {
      const errorMessage = `File with piece data for ${piece}/${scenarioId} is not available at ${scenarioRunResultsLocation.uri}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const scenarioRunResultsrError = await extractFile(
      readableOrError.right,
      scenarioRunResultsLocation.relativePath,
    );
    if (isLeft(scenarioRunResultsrError)) {
      const errorMessage = `Scenario Run Results file extraction failed: ${scenarioRunResultsLocation.relativePath}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const {
      marxanRunResults,
      blmResults,
    }: ScenarioRunResultsContent = JSON.parse(scenarioRunResultsrError.right);

    await this.geoprocessingEntityManager.transaction(async (em) => {
      if (marxanRunResults.length)
        await this.insertMarxanRunResults(scenarioId, marxanRunResults, em);

      if (blmResults.length)
        await this.insertBlmResults(scenarioId, blmResults, em);
    });

    return {
      importId: input.importId,
      componentId: input.componentId,
      pieceResourceId: scenarioId,
      projectId,
      piece: input.piece,
    };
  }

  private async insertMarxanRunResults(
    scenarioId: string,
    marxanResultsContent: MarxanRunResultsContent[],
    em: EntityManager,
  ) {
    const puidScenarioPuIdSelect: ProjectsPuSelectResult[] = await em
      .createQueryBuilder()
      .select('ppu.puid', 'puid')
      .addSelect('spd.id', 'scenarioPuId')
      .from(ScenariosPuPaDataGeo, 'spd')
      .leftJoin(ProjectsPuEntity, 'ppu', 'spd.project_pu_id = ppu.id')
      .where('spd.scenario_id = :scenarioId', { scenarioId })
      .execute();

    if (puidScenarioPuIdSelect.length !== marxanResultsContent.length) {
      this.logger.error('missing planning units');
      throw new Error('missing planning units');
    }

    const scenarioPuByPuid: Record<number, string> = {};
    puidScenarioPuIdSelect.forEach((row) => {
      scenarioPuByPuid[row.puid] = row.scenarioPuId;
    });

    const insertMarxanRunResultsValues = marxanResultsContent.map((result) => {
      return {
        includedCount: result.includedCount,
        values: result.values,
        scenarioPuId: scenarioPuByPuid[result.puid],
      };
    });

    await em
      .createQueryBuilder()
      .insert()
      .into(OutputScenariosPuDataGeoEntity)
      .values(insertMarxanRunResultsValues)
      .execute();
  }

  private async insertBlmResults(
    scenarioId: string,
    blmResultsContent: BlmResultsContent[],
    em: EntityManager,
  ) {
    const insertBlmResultsValues = blmResultsContent.map((blm) => {
      return { ...blm, scenarioId };
    });
    await em
      .createQueryBuilder()
      .insert()
      .into(BlmFinalResultEntity)
      .values(insertBlmResultsValues)
      .execute();
  }
}
