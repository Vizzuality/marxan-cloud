import { MigrationInterface, QueryRunner } from 'typeorm';

export class PrepareToStoreListOfRelevantFeaturesDataAlongsideFeatures1708525796000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * Only create the column; this is going to be populated - for any existing
     * features - through a separate script to be run outside of the
     * NestJS/TypeORM db migration flow, as this operation needs to deal with
     * data across apidb and geoprocessingdb.
     */
    await queryRunner.query(`
ALTER TABLE features
ADD COLUMN feature_data_stable_ids uuid[];
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE features
DROP COLUMN feature_data__stable_ids;
      `);
  }
}
