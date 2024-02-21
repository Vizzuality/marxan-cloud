import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureShapefileApiEvents1708099064649
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_event_kinds (id) values
      ('features.shapefile.import.submitted/v1/alpha'),
      ('features.shapefile.import.finished/v1/alpha'),
      ('features.shapefile.import.failed/v1/alpha')
    `);

    await queryRunner.query(`
      UPDATE features SET creation_status = 'created'
      WHERE creation_status = 'done';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM api_event_kinds WHERE id IN (
        'features.shapefile.import.submitted/v1/alpha',
        'features.shapefile.import.finished/v1/alpha',
        'features.shapefile.import.failed/v1/alpha')
    `);
    await queryRunner.query(`
      UPDATE features SET creation_status = 'done'
      WHERE creation_status = 'created';
    `);
  }
}
