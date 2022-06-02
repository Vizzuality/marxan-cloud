import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { JobStatus } from '@marxan/cloning/infrastructure/clone-piece-data/project-custom-features';
import { FeatureTag } from '@marxan/features';
import { GeoFeatureGeometry, GeometrySource } from '@marxan/geofeatures';
import {
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
import {
  PuvrsprDatRow,
  PuvsprDatReader,
} from './file-readers/puvspr-dat.reader';
import { SpecDatReader, SpecDatRow } from './file-readers/spec-dat.reader';

type FeaturesData = Omit<SpecDatRow, 'id'> & {
  id: string;
  project_id: string;
  featureIntegerId: number;
  feature_class_name: string;
  tag: string;
  creation_status: JobStatus;
};

@Injectable()
@LegacyProjectImportPieceProcessorProvider()
export class FeaturesLegacyProjectPieceImporter
  implements LegacyProjectImportPieceProcessor {
  constructor(
    private readonly filesRepo: LegacyProjectImportFilesRepository,
    private readonly specDatReader: SpecDatReader,
    private readonly puvsprDatReader: PuvsprDatReader,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(FeaturesLegacyProjectPieceImporter.name);
  }

  private async getProjectPusGeomsMap(
    projectId: string,
  ): Promise<Record<number, string>> {
    const projectPus: {
      puid: number;
      theGeom: string;
    }[] = await this.geoprocessingEntityManager
      .createQueryBuilder()
      .select(['puid'])
      .addSelect('pugs.the_geom', 'theGeom')
      .from(ProjectsPuEntity, 'ppus')
      .innerJoin(PlanningUnitsGeom, 'pugs', 'pugs.id = ppus.geom_id')
      .where('ppus.project_id = :projectId', { projectId })
      .execute();

    const projectPuIdByPuid: Record<number, string> = {};
    projectPus.forEach(({ puid, theGeom }) => {
      projectPuIdByPuid[puid] = theGeom;
    });

    return projectPuIdByPuid;
  }

  private getFeaturesDataInsertValues(
    features: FeaturesData[],
    puvsprDatRows: PuvrsprDatRow[],
    projectPusGeomsMap: Record<number, string>,
  ) {
    const featuresDataInsertValues: {
      id: string;
      featureId: string;
      theGeom: string;
      properties: Record<string, string | number>;
      source: GeometrySource;
    }[] = [];
    const nonExistingPus: number[] = [];

    features.forEach(async (feature) => {
      const filteredPuvspr = puvsprDatRows.filter(
        (row) => row.species === feature.featureIntegerId,
      );

      filteredPuvspr.forEach((filteredRow) => {
        const geometry = projectPusGeomsMap[filteredRow.pu];

        if (!geometry) {
          nonExistingPus.push(filteredRow.pu);
          return;
        }

        featuresDataInsertValues.push({
          id: v4(),
          featureId: feature.id,
          theGeom: geometry,
          properties: {
            name: feature.feature_class_name,
            featureId: feature.featureIntegerId,
            puid: filteredRow.pu,
          },
          source: GeometrySource.user_imported,
        });
      });
    });

    return { featuresDataInsertValues, nonExistingPus };
  }

  isSupported(piece: LegacyProjectImportPiece): boolean {
    return piece === LegacyProjectImportPiece.Features;
  }

  async run(
    input: LegacyProjectImportJobInput,
  ): Promise<LegacyProjectImportJobOutput> {
    const { files, projectId } = input;

    const specFeaturesFileOrError = files.find(
      (file) => file.type === LegacyProjectImportFileType.SpecDat,
    );

    if (!specFeaturesFileOrError)
      throw new Error('spec.dat file not found inside input file array');

    const specFileReadableOrError = await this.filesRepo.get(
      specFeaturesFileOrError.location,
    );

    if (isLeft(specFileReadableOrError))
      throw new Error('spec.dat file not found in files repo');

    const specDatRowsOrError = await this.specDatReader.readFile(
      specFileReadableOrError.right,
    );

    if (isLeft(specDatRowsOrError)) throw new Error(specDatRowsOrError.left);

    const specDatRows = specDatRowsOrError.right;

    const puvsprFeaturesFileOrError = files.find(
      (file) => file.type === LegacyProjectImportFileType.PuvsprDat,
    );

    if (!puvsprFeaturesFileOrError)
      throw new Error('puvspr.dat file not found inside input file array');

    const puvsprFileReadableOrError = await this.filesRepo.get(
      puvsprFeaturesFileOrError.location,
    );

    if (isLeft(puvsprFileReadableOrError))
      throw new Error('The puvspr.dat file not found in files repo');

    const puvsprDatRowsOrError = await this.puvsprDatReader.readFile(
      puvsprFileReadableOrError.right,
    );

    if (isLeft(puvsprDatRowsOrError))
      throw new Error(puvsprDatRowsOrError.left);

    const puvsprDatRows = puvsprDatRowsOrError.right;

    const projectPusGeomsMap = await this.getProjectPusGeomsMap(projectId);

    const nonExistingPus = await this.apiEntityManager.transaction(
      async (apiEm) => {
        const featuresInsertValues = specDatRows.map((feature) => {
          const featureId = v4();

          return {
            ...feature,
            project_id: projectId,
            featureIntegerId: feature.id,
            id: featureId,
            feature_class_name: feature.name,
            tag: FeatureTag.Species,
            creation_status: JobStatus.created,
          };
        });

        await Promise.all(
          featuresInsertValues.map(
            ({ id, feature_class_name, project_id, tag, creation_status }) =>
              apiEm
                .createQueryBuilder()
                .insert()
                .into('features')
                .values({
                  id,
                  feature_class_name,
                  project_id,
                  tag,
                  creation_status,
                })
                .execute(),
          ),
        );

        const {
          featuresDataInsertValues,
          nonExistingPus,
        } = this.getFeaturesDataInsertValues(
          featuresInsertValues,
          puvsprDatRows,
          projectPusGeomsMap,
        );

        const chunkSize = 1000;
        await Promise.all(
          chunk(featuresDataInsertValues, chunkSize).map((values) =>
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
