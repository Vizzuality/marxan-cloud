import { CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS } from '@marxan-geoprocessing/utils/chunk-size-for-batch-geodb-operations';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { BlmFinalResultEntity } from '@marxan/blm-calibration';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ResourceKind } from '@marxan/cloning/domain';
import {
  BlmResultsContent,
  MarxanRunResultsContent,
  OutputScenarioSummary,
  ScenarioRunResultsContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/scenario-run-results';
import {
  OutputScenariosPuDataGeoEntity,
  ScenariosOutputResultsApiEntity,
} from '@marxan/marxan-output';
import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { readableToBuffer } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { chunk } from 'lodash';
import { Repository } from 'typeorm';
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
  private readonly logger: Logger = new Logger(
    ScenarioRunResultsPieceImporter.name,
  );

  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    @InjectRepository(
      ScenariosOutputResultsApiEntity,
      geoprocessingConnections.apiDB.name,
    )
    private readonly outputSummariesRepo: Repository<ScenariosOutputResultsApiEntity>,
  ) {}

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return piece === ClonePiece.ScenarioRunResults;
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const { uris, projectId, piece, pieceResourceId: scenarioId } = input;

    try {
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

      const buffer = await readableToBuffer(readableOrError.right);
      const stringScenarioProtectedAreasOrError = buffer.toString();

      const {
        marxanRunResults,
        blmResults,
        outputSummaries,
      }: ScenarioRunResultsContent = JSON.parse(
        stringScenarioProtectedAreasOrError,
      );

      await this.geoprocessingEntityManager.transaction(async (em) => {
        if (marxanRunResults.length)
          await this.insertMarxanRunResults(scenarioId, marxanRunResults, em);

        if (blmResults.length)
          await this.insertBlmResults(scenarioId, blmResults, em);

        if (outputSummaries.length) {
          await this.insertOutputSummaries(scenarioId, outputSummaries);
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }

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

    await Promise.all(
      chunk(
        insertMarxanRunResultsValues,
        CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS,
      ).map((values) =>
        em
          .createQueryBuilder()
          .insert()
          .into(OutputScenariosPuDataGeoEntity)
          .values(values)
          .execute(),
      ),
    );
  }

  private async insertBlmResults(
    scenarioId: string,
    blmResultsContent: BlmResultsContent[],
    em: EntityManager,
  ) {
    const insertBlmResultsValues = blmResultsContent.map(({ png, ...blm }) => {
      return {
        ...blm,
        pngData: png ? Buffer.from(png) : undefined,
        scenarioId,
      };
    });
    await em
      .createQueryBuilder()
      .insert()
      .into(BlmFinalResultEntity)
      .values(insertBlmResultsValues)
      .execute();
  }

  private async insertOutputSummaries(
    scenarioId: string,
    outputSummaries: OutputScenarioSummary[],
  ) {
    return this.outputSummariesRepo.save(
      outputSummaries.map((row) => ({
        ...row,
        scenarioId,
      })),
      { chunk: CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS },
    );
  }
}
