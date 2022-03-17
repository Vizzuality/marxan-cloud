import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectsPuTable1646308580694 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE projects_pu(
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id uuid NOT NULL,
        puid int NOT NULL,
        geom_id uuid NOT NULL,
        geom_type planning_unit_grid_shape NOT NULL,
        CONSTRAINT unique_project_puids UNIQUE (project_id, puid),
        CONSTRAINT planning_units_geom_fk FOREIGN KEY (geom_id, geom_type) REFERENCES planning_units_geom(id, type) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX projects_pu_project_id_idx ON projects_pu(project_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE projects_pu');
  }
}
