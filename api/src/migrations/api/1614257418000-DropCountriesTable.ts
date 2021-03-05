import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Countries are handled in the geoprocessing db, as a view over the
 * admin_regions table, so we don't need this in the API db.
 */

export class DropCountriesTable1614257418000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DROP TABLE countries;
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE countries (
  iso_3166_1_alpha2 varchar(2) not null primary key,
  iso_3166_1_alpha3 varchar(3) not null,
  name varchar not null,
  local_names jsonb
);
`);
  }
}
