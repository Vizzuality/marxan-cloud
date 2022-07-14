import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFKBetweenPuvsprCalculationsAndProjectsPu1657780657222
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM puvspr_calculations;
    `);

    await queryRunner.query(`
      ALTER TABLE puvspr_calculations
        DROP COLUMN pu_id;
    `);

    await queryRunner.query(`
      ALTER TABLE puvspr_calculations
        ADD COLUMN project_pu_id uuid NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE puvspr_calculations
        ADD FOREIGN KEY (project_pu_id) REFERENCES projects_pu(id) 
        ON DELETE cascade;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE puvspr_calculations
        DROP COLUMN project_pu_id;
    `);

    await queryRunner.query(`
      ALTER TABLE puvspr_calculations
        ADD COLUMN pu_id integer NOT NULL;
    `);
  }
}
