import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ScenarioFeaturesData } from '@marxan/features';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import {
  LegacyProjectImportFileSnapshot,
  LegacyProjectImportFilesRepository,
  LegacyProjectImportFileType,
  LegacyProjectImportJobInput,
  LegacyProjectImportJobOutput,
  LegacyProjectImportPiece,
} from '@marxan/legacy-project-import';
import { HttpService, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { chunk } from 'lodash';
import { EntityManager, In, Repository } from 'typeorm';
import { AppConfig } from '../../utils/config.utils';
import {
  LegacyProjectImportPieceProcessor,
  LegacyProjectImportPieceProcessorProvider,
} from '../pieces/legacy-project-import-piece-processor';
import {
  specDatFeatureIdPropertyKey,
  specDatPuidPropertyKey,
} from './features.legacy-piece-importer';
import {
  PuvrsprDatRow,
  PuvsprDatReader,
} from './file-readers/puvspr-dat.reader';
import {
  PropSpecDatRow,
  SpecDatReader,
  SpecDatRow,
  TargetSpecDatRow,
} from './file-readers/spec-dat.reader';

type FeaturesSelectResult = {
  id: string;
};

type ApiEventSelectResult = {
  id: string;
};

type FeatureIdByIntegerId = Record<number, string>;

@Injectable()
@LegacyProjectImportPieceProcessorProvider()
export class FeaturesSpecificationLegacyProjectPieceImporter
  implements LegacyProjectImportPieceProcessor {
  constructor(
    private readonly filesRepo: LegacyProjectImportFilesRepository,
    private readonly specDatReader: SpecDatReader,
    private readonly puvsprDatReader: PuvsprDatReader,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectRepository(GeoFeatureGeometry)
    private readonly featuresDataRepo: Repository<GeoFeatureGeometry>,
    @InjectRepository(ScenarioFeaturesData)
    private readonly scenarioFeaturesDataRepo: Repository<ScenarioFeaturesData>,
    private readonly logger: Logger,
    private readonly httpService: HttpService,
  ) {
    this.logger.setContext(
      FeaturesSpecificationLegacyProjectPieceImporter.name,
    );
  }

  isSupported(piece: LegacyProjectImportPiece): boolean {
    return piece === LegacyProjectImportPiece.FeaturesSpecification;
  }

  private logAndThrow(message: string): never {
    this.logger.error(message);
    throw new Error(message);
  }

  private async getFileReadable(
    files: LegacyProjectImportFileSnapshot[],
    type: LegacyProjectImportFileType,
  ) {
    const file = files.find((file) => file.type === type);

    if (!file)
      this.logAndThrow(`${type} file not found inside input file array`);

    const readableOrError = await this.filesRepo.get(file.location);

    if (isLeft(readableOrError))
      this.logAndThrow(`${type} file not found in files repo`);

    return readableOrError.right;
  }

  private getFeaturesInPuvsprNotInSpec(
    specRows: SpecDatRow[],
    inputPuvsprRows: PuvrsprDatRow[],
  ): number[] {
    const notFoundIdsSet = new Set<number>(
      inputPuvsprRows.map((row) => row.species),
    );

    specRows.forEach((row) => notFoundIdsSet.delete(row.id));

    return Array.from(notFoundIdsSet);
  }

  private isPropSpecRowsArray(rows: SpecDatRow[]): rows is PropSpecDatRow[] {
    if (rows.length === 0) return true;
    const [first] = rows;
    return (first as PropSpecDatRow).prop !== undefined;
  }

  private getPropSpecRows(
    specRows: SpecDatRow[],
    puvsprRows: PuvrsprDatRow[],
  ): PropSpecDatRow[] {
    if (specRows.length === 0) return [];

    if (this.isPropSpecRowsArray(specRows)) return specRows;

    const featuresTotalAmount: Record<number, number> = {};
    specRows.forEach((feature) => {
      featuresTotalAmount[feature.id] = 0;
    });

    puvsprRows.forEach((row) => {
      featuresTotalAmount[row.species] += row.amount;
    });

    return (specRows as TargetSpecDatRow[]).map(({ target, ...row }) => ({
      ...row,
      prop: target / featuresTotalAmount[row.id],
    }));
  }

  private async getProjectFeaturesIds(projectId: string): Promise<string[]> {
    const result: FeaturesSelectResult[] = await this.apiEntityManager
      .createQueryBuilder()
      .select('id')
      .from('features', 'f')
      .where('project_id = :projectId', { projectId })
      .execute();

    return result.map((feature) => feature.id);
  }

  private async getFeatureIdByIntegerIdMap(
    projectId: string,
  ): Promise<FeatureIdByIntegerId> {
    const featureIds = await this.getProjectFeaturesIds(projectId);
    const featureIdByIntegerId: FeatureIdByIntegerId = {};
    const featuresData = await this.featuresDataRepo.find({
      where: { featureId: In(featureIds) },
    });

    featuresData.forEach(({ featureId, properties }) => {
      if (!featureId || !properties) return;
      const integerId = properties[specDatFeatureIdPropertyKey];

      if (integerId === undefined || typeof integerId !== 'number') return;
      if (featureIdByIntegerId[integerId] !== undefined) return;

      featureIdByIntegerId[integerId] = featureId;
    });

    return featureIdByIntegerId;
  }

  private async getApiEvent(
    topic: string,
    kind: API_EVENT_KINDS,
  ): Promise<ApiEventSelectResult | undefined> {
    const [event] = await this.apiEntityManager
      .createQueryBuilder()
      .select('id')
      .from('api_events', 'ae')
      .where('ae.topic = :topic', { topic })
      .andWhere('ae.kind = :kind', { kind })
      .execute();

    return event;
  }

  private async waitUntilSpecificationEnds(
    scenarioId: string,
    retries = 10,
  ): Promise<Either<string, true>> {
    const timeout = left('specification timeout');
    const failure = left('specification failed');
    const intervalSeconds = 3;
    let triesLeft = retries;

    return new Promise<Either<string, true>>((resolve) => {
      const interval = setInterval(async () => {
        const finishedEvent = await this.getApiEvent(
          scenarioId,
          API_EVENT_KINDS.scenario__specification__finished__v1__alpha1,
        );

        if (finishedEvent) {
          resolve(right(true));
          clearInterval(interval);
        }

        const failedEvent = await this.getApiEvent(
          scenarioId,
          API_EVENT_KINDS.scenario__specification__failed__v1__alpha1,
        );

        if (failedEvent) {
          resolve(failure);
          clearInterval(interval);
        }

        triesLeft = triesLeft - 1;

        if (triesLeft === 0) {
          resolve(timeout);
          clearInterval(interval);
        }
      }, intervalSeconds * 1000);
    });
  }

  private async runSpecification(
    specRows: PropSpecDatRow[],
    projectId: string,
    scenarioId: string,
  ): Promise<void> {
    const featureIdByIntegerId = await this.getFeatureIdByIntegerIdMap(
      projectId,
    );

    const { status } = await this.httpService
      .post(
        `${AppConfig.get<string>(
          'api.url',
        )}/api/v1/projects/import/legacy/${projectId}/specification`,
        {
          features: specRows
            .filter((row) => Boolean(featureIdByIntegerId[row.id]))
            .map((row) => ({
              featureId: featureIdByIntegerId[row.id],
              kind: 'plain',
              marxanSettings: {
                fpf: row.spf,
                prop: row.prop,
              },
            })),
        },
        {
          headers: {
            'x-api-key': AppConfig.get<string>('auth.xApiKey.secret'),
          },
          validateStatus: () => true,
        },
      )
      .toPromise();

    if (status !== HttpStatus.CREATED) {
      this.logAndThrow(
        `Specification launch request failed with status: ${status}`,
      );
    }

    const specificationResult = await this.waitUntilSpecificationEnds(
      scenarioId,
    );
    if (isLeft(specificationResult)) {
      this.logAndThrow(
        `Specification didn't finish: ${specificationResult.left}`,
      );
    }
  }

  private async updateScenarioFeaturesData(
    specRows: PropSpecDatRow[],
    puvsprRows: PuvrsprDatRow[],
    scenarioId: string,
  ): Promise<void> {
    const scenarioFeaturesData: ScenarioFeaturesData[] = await this.scenarioFeaturesDataRepo.find(
      {
        select: ['id', 'featureData'],
        where: { scenarioId },
        relations: ['featureData'],
      },
    );
    const amountsByIntegerIdAndPuid: Record<string, number> = {};
    const propertiesByIntegerId: Record<number, PropSpecDatRow> = {};

    puvsprRows.forEach((row) => {
      amountsByIntegerIdAndPuid[`${row.species}-${row.pu}`] = row.amount;
    });
    specRows.forEach((row) => {
      propertiesByIntegerId[row.id] = row;
    });

    const updateValues = scenarioFeaturesData.map((sfd) => {
      const integerId =
        sfd.featureData.properties?.[specDatFeatureIdPropertyKey];
      const puid = sfd.featureData.properties?.[specDatPuidPropertyKey];

      if (
        integerId === undefined ||
        typeof integerId !== 'number' ||
        puid === undefined
      )
        this.logAndThrow(
          'Scenario features data properties does not contain required properties',
        );

      const amount = amountsByIntegerIdAndPuid[`${integerId}-${puid}`];
      const { target2, targetocc, sepnum } = propertiesByIntegerId[integerId];

      return {
        id: sfd.id,
        target2,
        targetocc,
        sepnum,
        amountFromLegacyProject: amount,
      };
    });

    const chunkSize = 250;

    await Promise.all(
      chunk(updateValues, chunkSize).map((values) =>
        this.scenarioFeaturesDataRepo.save(values),
      ),
    );
  }

  async run(
    input: LegacyProjectImportJobInput,
  ): Promise<LegacyProjectImportJobOutput> {
    const { files, projectId, scenarioId } = input;

    const specDatReadable = await this.getFileReadable(
      files,
      LegacyProjectImportFileType.SpecDat,
    );
    const puvsprDatReadable = await this.getFileReadable(
      files,
      LegacyProjectImportFileType.PuvsprDat,
    );

    const specRowsOrError = await this.specDatReader.readFile(specDatReadable);
    const puvsprRowsOrError = await this.puvsprDatReader.readFile(
      puvsprDatReadable,
    );

    if (isLeft(specRowsOrError))
      this.logAndThrow(`Error in spec.dat file: ${specRowsOrError.left}`);
    if (isLeft(puvsprRowsOrError))
      this.logAndThrow(`Error in puvspr.dat file: ${puvsprRowsOrError.left}`);

    const notFoundFeatureIds = this.getFeaturesInPuvsprNotInSpec(
      specRowsOrError.right,
      puvsprRowsOrError.right,
    );

    if (notFoundFeatureIds.length) {
      this.logAndThrow(
        `puvspr.dat contains feature ids not found in spec.dat: ${notFoundFeatureIds.join(
          ', ',
        )}`,
      );
    }

    const specRows = this.getPropSpecRows(
      specRowsOrError.right,
      puvsprRowsOrError.right,
    );
    await this.runSpecification(specRows, projectId, scenarioId);
    await this.updateScenarioFeaturesData(
      specRows,
      puvsprRowsOrError.right,
      scenarioId,
    );

    return input;
  }
}
