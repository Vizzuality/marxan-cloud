import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
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
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  LegacyProjectImportPieceProcessor,
  LegacyProjectImportPieceProcessorProvider,
} from '../pieces/legacy-project-import-piece-processor';
import * as fastCsv from 'fast-csv';
import { Readable } from 'stream';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { chunk } from 'lodash';

type SpecDataEntry = {
  id: string;
  prop: string;
  name?: string;
  target?: string;
};

type PuvsprDataEntry = {
  species: string;
  pu: string;
  amount: string;
};

@Injectable()
@LegacyProjectImportPieceProcessorProvider()
export class FeaturesLegacyProjectPieceImporter
  implements LegacyProjectImportPieceProcessor {
  constructor(
    private readonly filesRepo: LegacyProjectImportFilesRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(FeaturesLegacyProjectPieceImporter.name);
  }

  isSupported(piece: LegacyProjectImportPiece): boolean {
    return piece === LegacyProjectImportPiece.Features;
  }

  async handleSpecDatFile(file: Readable): Promise<SpecDataEntry[]> {
    const itemsArray: any = [];

    await new Promise((resolve, reject) => {
      file
        .pipe(
          fastCsv.parse({ headers: true, delimiter: '\t', objectMode: true }),
        )
        .on('error', (error) => console.log(error))
        .on('data', (data) => itemsArray.push(data))
        .on('end', () => {
          resolve(itemsArray);
        });
    });

    return itemsArray;
  }

  async handlePuvsprDatFile(file: Readable): Promise<PuvsprDataEntry[]> {
    const itemsArray: any = [];

    await new Promise((resolve, reject) => {
      file
        .pipe(
          fastCsv.parse({ headers: true, delimiter: '\t', objectMode: true }),
        )
        .on('error', (error) => console.log(error))
        .on('data', (data) => itemsArray.push(data))
        .on('end', () => {
          resolve(itemsArray);
        });
    });

    return itemsArray;
  }

  async run(
    input: LegacyProjectImportJobInput,
  ): Promise<LegacyProjectImportJobOutput> {
    const { files, projectId } = input;

    const specFeaturesFileOrError = files.find(
      (file) => file.type === LegacyProjectImportFileType.SpecDat,
    );

    if (!specFeaturesFileOrError) {
      throw new Error('Shapefile not found inside input file array');
    }

    const specFileReadableOrError = await this.filesRepo.get(
      specFeaturesFileOrError.location,
    );

    if (isLeft(specFileReadableOrError)) {
      throw new Error('The spec.dat file provided is malformed or missing.');
    }

    const specDatRows = await this.handleSpecDatFile(
      specFileReadableOrError.right,
    );

    const puvsprFeaturesFileOrError = files.find(
      (file) => file.type === LegacyProjectImportFileType.SpecDat,
    );

    if (!puvsprFeaturesFileOrError) {
      throw new Error('Shapefile not found inside input file array');
    }

    const puvsprFileReadableOrError = await this.filesRepo.get(
      puvsprFeaturesFileOrError.location,
    );

    if (isLeft(puvsprFileReadableOrError)) {
      throw new Error('The puvspr.dat file provided is malformed or missing.');
    }
    const puvsprDatRows = await this.handlePuvsprDatFile(
      puvsprFileReadableOrError.right,
    );

    await this.apiEntityManager.transaction(async (apiEm) => {
      const featureIdByClassName: Record<string, string> = {};
      const insertValues = specDatRows.map((feature) => {
        if (feature.target) {
          throw new Error(
            'Target is not supported, please translate target to prop value',
          );
        }

        if (!feature.name) {
          throw new Error('Name column in spec.dat is compulsory. Try again');
        }
        const featureId = v4();

        return {
          ...feature,
          project_id: projectId,
          featureIntegerId: feature.id,
          id: featureId,
          feature_class_name: feature.name,
          is_custom: true,
        };
      });

      await Promise.all(
        insertValues.map((values) =>
          apiEm
            .createQueryBuilder()
            .insert()
            .into('features')
            .values(values)
            .execute(),
        ),
      );

      const puRepo = this.geoprocessingEntityManager.getRepository(
        ProjectsPuEntity,
      );

      const featuresDataInsertValues: any = [];

      await Promise.all(
        insertValues.map(async (feature) => {
          const filteredPuvspr = puvsprDatRows.filter(
            (row) => row.species === feature.id,
          );

          await Promise.all(
            filteredPuvspr.map(async (filteredRow) => {
              const puUnit = await puRepo.findOneOrFail({
                puid: +filteredRow.pu,
                projectId,
              });
              featuresDataInsertValues.push({
                id: v4(),
                featureId: feature.id,
                theGeom: puUnit.puGeom.theGeom,
                properties: {
                  name: feature.feature_class_name,
                  id: feature.featureIntegerId,
                },
              });
            }),
          );
        }),
      );

      const chunkSize = 1000;
      await Promise.all(
        chunk(featuresDataInsertValues, chunkSize).map((values) =>
          this.geoprocessingEntityManager
            .createQueryBuilder()
            .insert()
            .into(GeoFeatureGeometry)
            .values(values)
            .execute(),
        ),
      );
    });

    return input;
  }
}
