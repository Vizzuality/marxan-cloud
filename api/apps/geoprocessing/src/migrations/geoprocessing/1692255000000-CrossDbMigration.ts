import { DataSource, MigrationInterface, QueryRunner } from 'typeorm';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { Logger } from '@nestjs/common';

export class CrossDbMigration1692255000000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    
    const apiMigrationDataSource: DataSource = await(new DataSource({
      ...geoprocessingConnections.apiDB,
      name: 'apiMigration',
    })).initialize();

    const apiQueryRunner = apiMigrationDataSource.createQueryRunner();
    const apidbCanary = await apiQueryRunner.query(`
      select name from migrations order by timestamp;
    `);

    const geodbCanary = await queryRunner.query(`
      select name from migrations order by timestamp;
    `);

    Logger.debug('canary: apidb migrations');
    Logger.debug(JSON.stringify(apidbCanary));
    Logger.debug('canary: geodb migrations');
    Logger.debug(JSON.stringify(geodbCanary));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }
}
