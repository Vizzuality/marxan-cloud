import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncPuShapeEnumFromGeoprocessingToApi1645449750000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE planning_unit_grid_shape ADD VALUE 'irregular';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /**
     * Arguably not worth the effort sorry. Creating a new type with the old set
     * of values, making sure the values to be "dropped" are not used anywhere,
     * switch the use of the old type to the new one, drop the old type, rename
     * the new type to the old one...
     */
  }
}
