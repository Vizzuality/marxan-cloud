import { Injectable, Logger } from '@nestjs/common';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { InjectDataSource, InjectEntityManager } from '@nestjs/typeorm';
import { featureAmountCsvParser } from '@marxan-api/modules/geo-features/import/csv.parser';
import { FeatureAmountCSVDto } from '@marxan-api/modules/geo-features/dto/feature-amount-csv.dto';
import { FeatureAmountUploadRegistry } from '@marxan-api/modules/geo-features/import/features-amounts-upload-registry.api.entity';
import {
  importedFeatureNameAlreadyExist,
  unknownPuidsInFeatureAmountCsvUpload,
} from '@marxan-api/modules/geo-features/geo-features.service';
import { isLeft, left, right } from 'fp-ts/Either';
import { FeatureImportEventsService } from '@marxan-api/modules/geo-features/import/feature-import.events';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { chunk } from 'lodash';
import { CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS } from '@marxan/utils/chunk-size-for-batch-geodb-operations';

@Injectable()
export class FeatureAmountUploadService {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    @InjectDataSource(DbConnections.default)
    private readonly apiDataSource: DataSource,
    @InjectDataSource(DbConnections.geoprocessingDB)
    private readonly geoDataSource: DataSource,
    @InjectEntityManager(DbConnections.geoprocessingDB)
    private readonly geoEntityManager: EntityManager,
    @InjectEntityManager(DbConnections.default)
    private readonly apiEntityManager: EntityManager,
    private readonly events: FeatureImportEventsService,
  ) {}

  async uploadFeatureFromCsv(data: {
    fileBuffer: Buffer;
    projectId: string;
    userId: string;
  }) {
    const apiQueryRunner = this.apiDataSource.createQueryRunner();
    const geoQueryRunner = this.geoDataSource.createQueryRunner();

    await apiQueryRunner.connect();
    await geoQueryRunner.connect();

    await apiQueryRunner.startTransaction();
    await geoQueryRunner.startTransaction();

    let newSavedFeatures;
    try {
      // saving feature data to temporary table
      const featuresRegistry = await this.saveCsvToRegistry(
        data,
        apiQueryRunner,
      );

      if (isLeft(featuresRegistry)) {
        return left(featuresRegistry);
      }
      // Saving features and features amounts

      const newFeaturesToCreate = (
        await apiQueryRunner.manager
          .createQueryBuilder()
          .select('feature_name')
          .from('features_amounts', 'fa')
          .distinct(true)
          .where('fa.upload_id = :id', { id: featuresRegistry.right.id })
          .getRawMany()
      ).map((feature) => {
        return {
          featureClassName: feature.feature_name,
          projectId: data.projectId,
          creationStatus: JobStatus.done,
        };
      });

      const newFeatures = await apiQueryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(GeoFeature)
        .values(newFeaturesToCreate)
        .returning('*')
        .execute();

      newSavedFeatures = newFeatures.raw;

      for (const newFeature of newFeatures.raw) {
        const featureAmounts = await apiQueryRunner.manager
          .createQueryBuilder()
          .select(['fa.puid', 'fa.amount'])
          .from('features_amounts', 'fa')
          .where('fa.upload_id = :id', { id: featuresRegistry.right.id })
          .andWhere('fa.feature_name = :featureName', {
            featureName: newFeature.feature_class_name,
          })
          .getRawMany();

        const valuesToInsert = [];

        for (const featureAmount of featureAmounts) {
          valuesToInsert.push(
            `
            (
                (SELECT the_geom FROM project_pus WHERE puid = ${featureAmount.fa_puid}),
                '${newFeature.id}',
                ${featureAmount.fa_amount},
                (SELECT id FROM project_pus WHERE puid = ${featureAmount.fa_puid})
            )
            `,
          );
        }

        const chunks = chunk(
          valuesToInsert,
          CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS,
        );

        for (const chunk of chunks) {
          await geoQueryRunner.manager.query(
            `
           WITH project_pus AS (
                SELECT ppu.id, ppu.puid, pug.the_geom FROM projects_pu ppu JOIN planning_units_geom pug ON pug.id = ppu.geom_id WHERE ppu.project_id = $1
            )
            INSERT INTO features_data (the_geom, feature_id, amount, project_pu_id)
            VALUES
              ${chunk.join(', ')}
            RETURNING *
          `,
            [data.projectId],
          );
        }
      }

      // Removing temporary data
      await apiQueryRunner.manager.delete(FeatureAmountUploadRegistry, {
        id: featuresRegistry.right.id,
      });
      // Committing transaction

      await apiQueryRunner.commitTransaction();
      await geoQueryRunner.commitTransaction();
    } catch (err) {
      await apiQueryRunner.rollbackTransaction();
      await geoQueryRunner.rollbackTransaction();

      this.logger.error(
        'An error occurred creating features and saving amounts from csv (changes have been rolled back)',
        String(err),
      );
      return left(err);
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await apiQueryRunner.release();
      await geoQueryRunner.release();
    }
    return right(newSavedFeatures);
  }
  async saveCsvToRegistry(
    data: {
      fileBuffer: Buffer;
      projectId: string;
      userId: string;
    },
    queryRunner: QueryRunner,
  ): Promise<any> {
    try {
      await this.events.createEvent(data);

      const parsedFile = await featureAmountCsvParser(data.fileBuffer);

      const { featureNames, puids } = this.getFeatureNamesAndPuids(parsedFile);
      if (
        await this.areFeatureNamesNotAlreadyUsedInProject(
          data.projectId,
          featureNames,
          queryRunner.manager,
        )
      ) {
        return left(importedFeatureNameAlreadyExist);
      }
      if (!(await this.allInputPuidsKnownInProject(data.projectId, puids))) {
        return left(unknownPuidsInFeatureAmountCsvUpload);
      }
      const importedRegistry = await this.saveFeaturesToRegistry(
        parsedFile,
        data.projectId,
        data.userId,
        queryRunner.manager,
      );
      await this.events.finishEvent();
      return right(importedRegistry);
    } catch (e) {
      await this.events.failEvent(e);
      if (isLeft(e)) {
        return left(e);
      }
      throw e;
    }
  }

  private async saveFeaturesToRegistry(
    features: FeatureAmountCSVDto[],
    projectId: string,
    userId: string,
    entityManager: EntityManager,
  ): Promise<FeatureAmountUploadRegistry> {
    return entityManager.getRepository(FeatureAmountUploadRegistry).save({
      projectId,
      userId,
      uploadedFeatures: features,
    });
  }

  private async areFeatureNamesNotAlreadyUsedInProject(
    projectId: string,
    featureNames: string[],
    entityManager: EntityManager,
  ): Promise<boolean> {
    const featuresInDB = await entityManager
      .createQueryBuilder()
      .select('features.feature_class_name')
      .from('features', 'features')
      .where('features.project_id = :projectId', { projectId })
      .andWhere('features.feature_class_name IN (:...featureNames)', {
        featureNames,
      })
      .distinct(true)
      .getMany();

    return !!featuresInDB.length;
  }

  private async allInputPuidsKnownInProject(
    projectId: string,
    puids: number[],
  ): Promise<boolean> {
    const maxInputPuid = Math.max(...puids);
    const maxDbPuid = await this.geoEntityManager
      .createQueryBuilder()
      .from('projects_pu', 'pu')
      .select('MAX(pu.puid)', 'maxPuid')
      .where('pu.project_id = :projectId', { projectId })
      .getRawOne();

    return maxInputPuid <= maxDbPuid.maxPuid;
  }

  private getFeatureNamesAndPuids(
    parsedCsv: FeatureAmountCSVDto[],
  ): { featureNames: string[]; puids: number[] } {
    const { featureNames, puids } = parsedCsv.reduce(
      (acc, dto) => {
        acc.featureNames.add(dto.featureName);
        acc.puids.add(dto.puid);
        return acc;
      },
      {
        featureNames: new Set<string>(),
        puids: new Set<number>(),
      },
    );

    return { featureNames: Array.from(featureNames), puids: Array.from(puids) };
  }
}
