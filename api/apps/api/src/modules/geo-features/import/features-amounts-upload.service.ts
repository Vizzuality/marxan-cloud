import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
import { isLeft, left, Right, right } from 'fp-ts/Either';
import { FeatureImportEventsService } from '@marxan-api/modules/geo-features/import/feature-import.events';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { chunk } from 'lodash';
import { Left } from 'fp-ts/lib/Either';
import { CHUNK_SIZE_FOR_BATCH_APIDB_OPERATIONS } from '@marxan-api/utils/chunk-size-for-batch-apidb-operations';
import { UploadedFeatureAmount } from '@marxan-api/modules/geo-features/import/features-amounts-data.api.entity';
import { Project } from '@marxan-api/modules/projects/project.api.entity';

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
  }): Promise<Left<any> | Right<GeoFeature[]>> {
    const apiQueryRunner = this.apiDataSource.createQueryRunner();
    const geoQueryRunner = this.geoDataSource.createQueryRunner();

    await apiQueryRunner.connect();
    await geoQueryRunner.connect();

    await apiQueryRunner.startTransaction();
    await geoQueryRunner.startTransaction();

    let newFeaturesFromCsvUpload;
    try {
      await this.events.createEvent(data);
      // saving feature data to temporary table
      const featuresRegistry = await this.saveCsvToRegistry(
        data,
        apiQueryRunner,
      );

      if (isLeft(featuresRegistry)) {
        return featuresRegistry;
      }
      // Saving new features to apiDB 'features' table

      newFeaturesFromCsvUpload = await this.saveNewFeaturesFromCsvUpload(
        apiQueryRunner,
        featuresRegistry.right.id,
        data.projectId,
      );

      // Saving new features amounts and geoms to geoDB 'features_amounts' table
      await this.saveNewFeaturesAmountsFromCsvUpload(
        newFeaturesFromCsvUpload,
        apiQueryRunner,
        geoQueryRunner,
        featuresRegistry.right.id,
        data.projectId,
      );

      // Removing temporary data from apiDB uploads tables
      await apiQueryRunner.manager.delete(FeatureAmountUploadRegistry, {
        id: featuresRegistry.right.id,
      });

      // Setting project source to legacy-import to create puvspr.dat files from pre-calculated amounts, to allow to use new features after upload

      await apiQueryRunner.manager
        .createQueryBuilder()
        .update(Project)
        .set({ sources: 'legacy_import' })
        .where('id = :projectId', { projectId: data.projectId })
        .execute();

      // Committing transaction

      await apiQueryRunner.commitTransaction();
      await geoQueryRunner.commitTransaction();
    } catch (err) {
      await this.events.failEvent(err);
      await apiQueryRunner.rollbackTransaction();
      await geoQueryRunner.rollbackTransaction();

      this.logger.error(
        'An error occurred creating features and saving amounts from csv (changes have been rolled back)',
        String(err),
      );
      throw new BadRequestException(err);
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await apiQueryRunner.release();
      await geoQueryRunner.release();
      await this.events.finishEvent();
    }
    return right(newFeaturesFromCsvUpload);
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
      return right(importedRegistry);
    } catch (e) {
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
    const featuresChunks = chunk(
      features,
      CHUNK_SIZE_FOR_BATCH_APIDB_OPERATIONS,
    );
    const newUpload = await entityManager
      .getRepository(FeatureAmountUploadRegistry)
      .save({
        projectId,
        userId,
      });
    for (const chunk of featuresChunks) {
      await entityManager
        .createQueryBuilder()
        .insert()
        .into(UploadedFeatureAmount)
        .values(chunk.map((feature) => ({ ...feature, upload: newUpload })))
        .execute();
    }
    return newUpload;
  }

  private async saveNewFeaturesFromCsvUpload(
    queryRunner: QueryRunner,
    uploadId: string,
    projectId: string,
  ) {
    const newFeaturesToCreate = (
      await queryRunner.manager
        .createQueryBuilder()
        .select('feature_name')
        .from('features_amounts', 'fa')
        .distinct(true)
        .where('fa.upload_id = :id', { id: uploadId })
        .getRawMany()
    ).map((feature) => {
      return {
        featureClassName: feature.feature_name,
        projectId: projectId,
        creationStatus: JobStatus.done,
      };
    });

    const newFeatures = await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(GeoFeature)
      .values(newFeaturesToCreate)
      .returning('*')
      .execute();

    return newFeatures.raw;
  }

  private async saveNewFeaturesAmountsFromCsvUpload(
    newFeaturesFromCsvUpload: any[],
    apiQueryRunner: QueryRunner,
    geoQueryRunner: QueryRunner,
    uploadId: string,
    projectId: string,
  ) {
    for (const newFeature of newFeaturesFromCsvUpload) {
      const featureAmounts = await apiQueryRunner.manager
        .createQueryBuilder()
        .select(['fa.puid', 'fa.amount'])
        .from('features_amounts', 'fa')
        .where('fa.upload_id = :uploadId', { uploadId })
        .andWhere('fa.feature_name = :featureName', {
          featureName: newFeature.feature_class_name,
        })
        .getRawMany();

      const featuresChunks = chunk(
        featureAmounts,
        CHUNK_SIZE_FOR_BATCH_APIDB_OPERATIONS,
      );

      for (const featureChunk of featuresChunks) {
        const firstParameterNumber = 2;
        const parameters: any[] = [projectId];
        const valuesToInsert = featureChunk.map((featureAmount, index) => {
          parameters.push(
            ...[
              featureAmount.fa_puid,
              newFeature.id,
              featureAmount.fa_amount,
              featureAmount.fa_puid,
            ],
          );
          return `
            (
                (SELECT the_geom FROM project_pus WHERE puid = $${
                  firstParameterNumber + index * 4
                }),
                $${firstParameterNumber + index * 4 + 1},
                $${firstParameterNumber + index * 4 + 2},
                (SELECT id FROM project_pus WHERE puid = $${
                  firstParameterNumber + index * 4 + 3
                })
            )
            `;
        });
        await geoQueryRunner.manager.query(
          `
           WITH project_pus AS (
                SELECT ppu.id, ppu.puid, pug.the_geom FROM projects_pu ppu JOIN planning_units_geom pug ON pug.id = ppu.geom_id WHERE ppu.project_id = $1
            )
            INSERT INTO features_data (the_geom, feature_id, amount, project_pu_id)
            VALUES
              ${valuesToInsert.join(', ')}
            RETURNING *
          `,
          parameters,
        );
      }
    }
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

  private getFeatureNamesAndPuids(parsedCsv: FeatureAmountCSVDto[]): {
    featureNames: string[];
    puids: number[];
  } {
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
