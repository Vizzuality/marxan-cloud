import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { InjectDataSource, InjectEntityManager } from '@nestjs/typeorm';
import {
  duplicateHeadersInFeatureAmountCsvUpload,
  duplicatePuidsInFeatureAmountCsvUpload,
  featureAmountCsvParser,
  noFeaturesFoundInInFeatureAmountCsvUpload,
} from '@marxan-api/modules/geo-features/import/csv.parser';
import { FeatureAmountCSVDto } from '@marxan-api/modules/geo-features/dto/feature-amount-csv.dto';
import { FeatureAmountUploadRegistry } from '@marxan-api/modules/geo-features/import/features-amounts-upload-registry.api.entity';
import {
  GeoFeaturesService,
  importedFeatureNameAlreadyExist,
  missingPuidColumnInFeatureAmountCsvUpload,
  unknownPuidsInFeatureAmountCsvUpload,
} from '@marxan-api/modules/geo-features/geo-features.service';
import { isLeft, left, Right, right } from 'fp-ts/Either';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { chunk } from 'lodash';
import { Left } from 'fp-ts/lib/Either';
import { CHUNK_SIZE_FOR_BATCH_APIDB_OPERATIONS } from '@marxan-api/utils/chunk-size-for-batch-apidb-operations';
import { UploadedFeatureAmount } from '@marxan-api/modules/geo-features/import/features-amounts-data.api.entity';
import { FeatureCSVImportEventsService } from '@marxan-api/modules/geo-features/import/feature-csv-import.events';

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
    private readonly events: FeatureCSVImportEventsService,
    @Inject(forwardRef(() => GeoFeaturesService))
    private readonly geoFeaturesService: GeoFeaturesService,
  ) {}

  async uploadFeatureFromCsvAsync(
    fileBuffer: Buffer,
    projectId: string,
    userId: string,
  ) {
    setTimeout(async () => {
      try {
        await this.uploadFeatureFromCsv({
          fileBuffer,
          projectId,
          userId,
        });
      } catch (e) {
        this.logger.error(e);
      }
    });
  }

  async uploadFeatureFromCsv(data: {
    fileBuffer: Buffer;
    projectId: string;
    userId: string;
  }): Promise<Left<any> | Right<GeoFeature[]>> {
    //Because feature CSV files are bound to be increasingly larger, this can cause problems when trying to save a big
    //JSONB value into postgres eventually crashing due to an memory error, so the CSV file is ignored for the api event
    const { fileBuffer: _fileBuffer, ...apiEventData } = data;
    await this.events.submittedEvent(data.projectId, apiEventData);

    const apiQueryRunner = this.apiDataSource.createQueryRunner();
    const geoQueryRunner = this.geoDataSource.createQueryRunner();

    await apiQueryRunner.connect();
    await geoQueryRunner.connect();

    await apiQueryRunner.startTransaction();
    await geoQueryRunner.startTransaction();

    let newFeaturesFromCsvUpload;
    try {
      this.logger.log(
        `Starting process of parsing csv file and saving amount data to temporary storage`,
      );

      // saving feature data to temporary table
      const featuresRegistry: Left<any> | Right<FeatureAmountUploadRegistry> =
        await this.saveCsvToRegistry(data, apiQueryRunner);

      if (isLeft(featuresRegistry)) {
        // Some validations done while parsing csv in stream return nested Left object when being rejected as left
        // Todo: make validations during csv parse more unified
        const errorCode = featuresRegistry.left.left ?? featuresRegistry.left;

        throw this.csvErrorMapper(errorCode);
      }
      // Saving new features to apiDB 'features' table

      this.logger.log(`Saving new features to (apiBD).features table...`);
      //features entities are created here
      newFeaturesFromCsvUpload = await this.saveNewFeaturesFromCsvUpload(
        apiQueryRunner,
        featuresRegistry.right.id,
        data.projectId,
      );
      this.logger.log(`New features saved in (apiBD).features table`);

      // Saving new features amounts and geoms to geoDB 'features_amounts' table
      this.logger.log(
        `Starting the process of saving new features amounts and geoms to (geoDB).features_amounts table`,
      );
      await this.saveNewFeaturesAmountsFromCsvUpload(
        newFeaturesFromCsvUpload,
        apiQueryRunner,
        geoQueryRunner,
        featuresRegistry.right.id,
        data.projectId,
      );

      // Removing temporary data from apiDB uploads tables
      this.logger.log(
        `Removing data from temporary tables after successful upload...`,
      );
      await apiQueryRunner.manager.delete(FeatureAmountUploadRegistry, {
        id: featuresRegistry.right.id,
      });

      this.logger.log(
        `Upload temporary data removed from apiDB uploads tables`,
      );

      this.logger.log(`Saving min and max amounts for new features...`);
      await this.geoFeaturesService.saveAmountRangeForFeatures(
        newFeaturesFromCsvUpload.map((feature) => feature.id),
        apiQueryRunner.manager,
        geoQueryRunner.manager,
      );

      for (const feature of newFeaturesFromCsvUpload) {
        await apiQueryRunner.manager
          .getRepository(GeoFeature)
          .update({ id: feature.id }, { creationStatus: JobStatus.created });
      }

      this.logger.log(`Csv file upload process finished successfully`);
      // Committing transaction
      await apiQueryRunner.commitTransaction();
      await geoQueryRunner.commitTransaction();

      await this.events.finishEvent(data.projectId);
    } catch (err) {
      await apiQueryRunner.rollbackTransaction();
      await geoQueryRunner.rollbackTransaction();

      await this.events.failEvent(data.projectId, err);

      this.logger.error(
        'An error occurred while creating features and saving amounts from csv (changes have been rolled back)',
        String(err),
      );
      throw err;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await apiQueryRunner.release();
      await geoQueryRunner.release();
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
      this.logger.log(`Parsing csv file...`);

      const parsedFile = await featureAmountCsvParser(data.fileBuffer);

      const { featureNames, puids } = this.getFeatureNamesAndPuids(parsedFile);

      this.logger.log(`Validating parsed csv file...`);

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

      this.logger.log(`Saving parsed data to temporary storage...`);
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
      throw new BadRequestException(e);
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

    this.logger.log(`Saving a new upload data to temporary table...`);
    const newUpload = await entityManager
      .getRepository(FeatureAmountUploadRegistry)
      .save({
        projectId,
        userId,
      });
    for (const [index, chunk] of featuresChunks.entries()) {
      this.logger.log(
        `Inserting chunk ${index}/${featuresChunks.length} to temporary table...`,
      );
      await entityManager
        .createQueryBuilder()
        .insert()
        .into(UploadedFeatureAmount)
        .values(chunk.map((feature) => ({ ...feature, upload: newUpload })))
        .execute();
    }
    this.logger.log(`Data from CSV file saved to temporary table`);
    return newUpload;
  }

  private csvErrorMapper(
    error:
      | typeof importedFeatureNameAlreadyExist
      | typeof unknownPuidsInFeatureAmountCsvUpload
      | typeof missingPuidColumnInFeatureAmountCsvUpload
      | typeof duplicatePuidsInFeatureAmountCsvUpload
      | typeof duplicateHeadersInFeatureAmountCsvUpload
      | typeof noFeaturesFoundInInFeatureAmountCsvUpload
      | Error,
  ) {
    switch (error) {
      case importedFeatureNameAlreadyExist:
        return new BadRequestException('Imported Features already present');
      case unknownPuidsInFeatureAmountCsvUpload:
        return new BadRequestException('Unknown PUIDs');
      case missingPuidColumnInFeatureAmountCsvUpload:
        return new BadRequestException('Missing PUID column');
      case noFeaturesFoundInInFeatureAmountCsvUpload:
        return new BadRequestException(
          'No features found in feature amount CSV upload',
        );
      case duplicateHeadersInFeatureAmountCsvUpload:
        return new BadRequestException(
          'Duplicate headers in feature amount CSV upload',
        );
      case duplicatePuidsInFeatureAmountCsvUpload:
        return new BadRequestException(
          'Duplicate PUIDs in feature amount CSV upload',
        );
    }
  }

  private async saveNewFeaturesFromCsvUpload(
    queryRunner: QueryRunner,
    uploadId: string,
    projectId: string,
  ): Promise<GeoFeature[]> {
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
        creationStatus: JobStatus.running,
        isLegacy: true,
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
    for (const [index, newFeature] of newFeaturesFromCsvUpload.entries()) {
      this.logger.log(
        `Getting feature amounts for feature number  ${index + 1}: ${
          newFeature.feature_class_name
        }`,
      );
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

      this.logger.log(
        `Feature data divided into ${featuresChunks.length} chunks`,
      );
      for (const [amountIndex, featureChunk] of featuresChunks.entries()) {
        this.logger.log(
          `Starting to save chunk ${amountIndex}/${featuresChunks.length} of amounts of feature ${newFeature.feature_class_name}...`,
        );
        const firstParameterNumber = 2;
        const parameters: any[] = [projectId];
        this.logger.log(
          `Generating values to insert for chunk ${amountIndex}/${featuresChunks.length}...`,
        );
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

        this.logger.log(
          `Inserting amounts of feature per planning unit of chunk ${amountIndex}/${featuresChunks.length} into (geoDB).features_data table...`,
        );
        await geoQueryRunner.manager.query(
          `
           WITH project_pus AS NOT MATERIALIZED (
                SELECT ppu.id, ppu.puid, pug.the_geom FROM projects_pu ppu JOIN planning_units_geom pug ON pug.id = ppu.geom_id WHERE ppu.project_id = $1
            )
            INSERT INTO features_data (the_geom, feature_id, amount, project_pu_id)
            VALUES
              ${valuesToInsert.join(', ')}
            RETURNING *
          `,
          parameters,
        );
        this.logger.log(
          `Chunk ${amountIndex}/${featuresChunks.length} saved to (geoDB).features_data`,
        );
      }
      this.logger.log(
        `All chunks of feature ${newFeature.feature_class_name} saved`,
      );

      await geoQueryRunner.manager.query(
        `INSERT INTO feature_amounts_per_planning_unit (project_id, feature_id, amount, project_pu_id)
                SELECT $1, $2, amount, project_pu_id
                FROM features_data where feature_id = $2`,
        [projectId, newFeature.id],
      );
    }
    this.logger.log(
      `Data for all new features was saved to (geoDB).features_data`,
    );
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
