import { CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS } from '@marxan-geoprocessing/utils/chunk-size-for-batch-geodb-operations';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { JobStatus } from '@marxan/cloning/infrastructure/clone-piece-data/project-custom-features';
import { GeoFeatureGeometry, GeometrySource } from '@marxan/geofeatures';
import {
  LegacyProjectImportFileSnapshot,
  LegacyProjectImportFilesRepository,
  LegacyProjectImportFileType,
  LegacyProjectImportJobInput,
  LegacyProjectImportJobOutput,
  LegacyProjectImportPiece,
} from '@marxan/legacy-project-import';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { chunk } from 'lodash';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  LegacyProjectImportPieceProcessor,
  LegacyProjectImportPieceProcessorProvider,
} from '../pieces/legacy-project-import-piece-processor';
import { DatFileDelimiterFinder } from './file-readers/dat-file.delimiter-finder';
import {
  PuvrsprDatRow,
  PuvsprDatReader,
} from './file-readers/puvspr-dat.reader';
import { SpecDatReader, SpecDatRow } from './file-readers/spec-dat.reader';

type FeaturesData = {
  id: string;
  specDatFeatureId: number;
  feature_class_name: string;
};

export const specDatFeatureIdPropertyKey = 'specDatFeatureId';
export const specDatPuidPropertyKey = 'puid';

@Injectable()
@LegacyProjectImportPieceProcessorProvider()
export class FeaturesLegacyProjectPieceImporter
  implements LegacyProjectImportPieceProcessor
{
  private readonly logger: Logger = new Logger(
    FeaturesLegacyProjectPieceImporter.name,
  );

  constructor(
    private readonly filesRepo: LegacyProjectImportFilesRepository,
    private readonly specDatReader: SpecDatReader,
    private readonly puvsprDatReader: PuvsprDatReader,
    private readonly datFileDelimiterFinder: DatFileDelimiterFinder,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
  ) {}

  isSupported(piece: LegacyProjectImportPiece): boolean {
    return piece === LegacyProjectImportPiece.Features;
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

  private async getSpecDatData(files: LegacyProjectImportFileSnapshot[]) {
    const firstLineReadable = await this.getFileReadable(
      files,
      LegacyProjectImportFileType.SpecDat,
    );

    const delimiterOrError =
      await this.datFileDelimiterFinder.findDelimiter(firstLineReadable);
    if (isLeft(delimiterOrError))
      this.logAndThrow(
        `Invalid delimiter in spec.dat file. Use either comma or tabulator as your file delimiter.`,
      );

    const fileReadable = await this.getFileReadable(
      files,
      LegacyProjectImportFileType.SpecDat,
    );

    const rowsOrError = await this.specDatReader.readFile(
      fileReadable,
      delimiterOrError.right,
    );
    if (isLeft(rowsOrError))
      this.logAndThrow(`Error in spec.dat file: ${rowsOrError.left}`);

    return rowsOrError.right;
  }

  private async getPuvsprDatData(files: LegacyProjectImportFileSnapshot[]) {
    const firstLineReadable = await this.getFileReadable(
      files,
      LegacyProjectImportFileType.PuvsprDat,
    );

    const delimiterOrError =
      await this.datFileDelimiterFinder.findDelimiter(firstLineReadable);
    if (isLeft(delimiterOrError))
      this.logAndThrow(
        `Invalid delimiter in puvspr.dat file. Use either comma or tabulator as your file delimiter.`,
      );

    const fileReadable = await this.getFileReadable(
      files,
      LegacyProjectImportFileType.PuvsprDat,
    );

    const rowsOrError = await this.puvsprDatReader.readFile(
      fileReadable,
      delimiterOrError.right,
    );
    if (isLeft(rowsOrError))
      this.logAndThrow(`Error in puvspr.dat file: ${rowsOrError.left}`);

    return rowsOrError.right;
  }

  private async getProjectPusGeomsMap(
    projectId: string,
  ): Promise<Record<number, { theGeom: string; projectPuId: string }>> {
    const projectPus: {
      id: string;
      puid: number;
      theGeom: string;
    }[] = await this.geoprocessingEntityManager
      .createQueryBuilder()
      .select(['puid'])
      .addSelect('ppus.id', 'id')
      .addSelect('pugs.the_geom', 'theGeom')
      .from(ProjectsPuEntity, 'ppus')
      .innerJoin(PlanningUnitsGeom, 'pugs', 'pugs.id = ppus.geom_id')
      .where('ppus.project_id = :projectId', { projectId })
      .execute();

    const projectPuIdByPuid: Record<
      number,
      { theGeom: string; projectPuId: string }
    > = {};
    projectPus.forEach(({ puid, theGeom, id }) => {
      projectPuIdByPuid[puid] = { theGeom, projectPuId: id };
    });

    return projectPuIdByPuid;
  }

  private getFeaturesDataInsertValues(
    features: FeaturesData[],
    puvsprDatRows: PuvrsprDatRow[],
    projectPusGeomsMap: Record<
      number,
      { theGeom: string; projectPuId: string }
    >,
  ) {
    const featuresDataInsertValues: {
      id: string;
      featureId: string;
      theGeom: string;
      properties: Record<string, string | number>;
      source: GeometrySource;
      amount: number;
      projectPuId: string;
    }[] = [];
    const nonExistingPus: number[] = [];

    features.forEach(async (feature) => {
      const filteredPuvspr = puvsprDatRows.filter(
        (row) => row.species === feature.specDatFeatureId,
      );

      filteredPuvspr.forEach((filteredRow) => {
        const geomAndPuId = projectPusGeomsMap[filteredRow.pu];
        const amount = filteredRow.amount;

        if (!geomAndPuId) {
          nonExistingPus.push(filteredRow.pu);
          return;
        }

        const { theGeom, projectPuId } = geomAndPuId;

        featuresDataInsertValues.push({
          id: v4(),
          featureId: feature.id,
          theGeom,
          properties: {
            name: feature.feature_class_name,
            [specDatFeatureIdPropertyKey]: feature.specDatFeatureId,
            [specDatPuidPropertyKey]: filteredRow.pu,
          },
          source: GeometrySource.user_imported,
          amount,
          projectPuId,
        });
      });
    });

    return { featuresDataInsertValues, nonExistingPus };
  }

  private getDuplicateFeatureIds(rows: SpecDatRow[]) {
    const duplicateIds = new Set<number>();
    const knownIds: Record<number, true> = {};

    rows.forEach((row) => {
      const { id } = row;

      const knownPuid = knownIds[id];

      if (knownPuid) duplicateIds.add(id);
      else knownIds[id] = true;
    });

    return Array.from(duplicateIds);
  }

  private getDuplicateFeatureNames(rows: SpecDatRow[]) {
    const duplicateNames = new Set<string>();
    const knownNames: Record<string, true> = {};

    rows.forEach((row) => {
      const { name } = row;

      const knownPuid = knownNames[name];

      if (knownPuid) duplicateNames.add(name);
      else knownNames[name] = true;
    });

    return Array.from(duplicateNames);
  }

  async run(
    input: LegacyProjectImportJobInput,
  ): Promise<LegacyProjectImportJobOutput> {
    const { files, projectId } = input;

    const specDatRows = await this.getSpecDatData(files);

    const puvsprDatRows = await this.getPuvsprDatData(files);

    const duplicateFeatureIds = this.getDuplicateFeatureIds(specDatRows);
    if (duplicateFeatureIds.length) {
      throw new Error(
        `spec.dat contains duplicate feature ids: ${duplicateFeatureIds.join(
          ', ',
        )}`,
      );
    }

    const duplicateFeatureNames = this.getDuplicateFeatureNames(specDatRows);
    if (duplicateFeatureNames.length) {
      throw new Error(
        `spec.dat contains duplicate feature names: ${duplicateFeatureNames.join(
          ', ',
        )}`,
      );
    }

    const projectPusGeomsMap = await this.getProjectPusGeomsMap(projectId);

    const featureUuidByNumericId: Record<number, string> = {};
    const nonExistingPus = await this.apiEntityManager.transaction(
      async (apiEm) => {
        const featuresInsertValues = specDatRows.map((feature) => {
          const featureId = v4();
          featureUuidByNumericId[feature.id] = featureId;

          return {
            project_id: projectId,
            id: featureId,
            feature_class_name: feature.name,
            creation_status: JobStatus.created,
            created_by: input.ownerId,
            is_legacy: true,
          };
        });

        await Promise.all(
          featuresInsertValues.map((value) =>
            apiEm
              .createQueryBuilder()
              .insert()
              .into('features')
              .values(value)
              .execute(),
          ),
        );

        const featuresData = specDatRows.map((row) => ({
          id: featureUuidByNumericId[row.id],
          specDatFeatureId: row.id,
          feature_class_name: row.name,
        }));

        const { featuresDataInsertValues, nonExistingPus } =
          this.getFeaturesDataInsertValues(
            featuresData,
            puvsprDatRows,
            projectPusGeomsMap,
          );

        await Promise.all(
          chunk(
            featuresDataInsertValues,
            CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS,
          ).map((values) =>
            this.geoprocessingEntityManager
              .createQueryBuilder()
              .insert()
              .into(GeoFeatureGeometry)
              .values(
                values.map(({ theGeom, ...feature }) => {
                  return { theGeom: () => `'${theGeom}'`, ...feature };
                }),
              )
              .execute(),
          ),
        );

        return nonExistingPus;
      },
    );

    return {
      ...input,
      warnings: nonExistingPus.length
        ? [`puvspr.dat contains unknown puids: ${nonExistingPus.join(', ')}`]
        : undefined,
    };
  }
}
