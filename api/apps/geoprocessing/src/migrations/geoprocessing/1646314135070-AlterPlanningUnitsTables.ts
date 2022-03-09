import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterPlanningUnitsTables1646314135070
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP VIEW scenario_pu_features_entity');
    await queryRunner.query('DROP VIEW scenario_puvspr_geo_entity');

    await queryRunner.query(
      'ALTER TABLE planning_units_geom DROP COLUMN project_id',
    );
    await queryRunner.query('ALTER TABLE scenarios_pu_data DROP COLUMN puid');
    await queryRunner.query(
      'ALTER TABLE scenarios_pu_data DROP COLUMN pu_geom_id',
    );
    await queryRunner.query(`
      ALTER TABLE scenarios_pu_data 
	      ADD COLUMN project_pu_id uuid NOT NULL,
	      ADD CONSTRAINT projects_pu_fk FOREIGN KEY(project_pu_id) REFERENCES projects_pu(id) ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE planning_units_geom
      ADD CONSTRAINT planning_units_geom_the_geom_type_key UNIQUE (the_geom, type);
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX planning_units_geom_the_geom_type_check
      ON planning_units_geom(the_geom_hash, type);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE scenarios_pu_data DROP COLUMN project_pu_id',
    );
    await queryRunner.query(
      'ALTER TABLE scenarios_pu_data ADD COLUMN pu_geom_id uuid NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE scenarios_pu_data ADD COLUMN puid integer NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE planning_units_geom ADD COlUMN project_id uuid null',
    );

    await queryRunner.query(`
      ALTER TABLE planning_units_geom
      ADD CONSTRAINT planning_units_geom_the_geom_type_key UNIQUE (the_geom, type, project_id);
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX planning_units_geom_the_geom_type_project_id_check
      ON planning_units_geom(the_geom_hash, type, coalesce(project_id, '00000000-0000-0000-0000-000000000000'));
    `);

    await queryRunner.query(`
      CREATE OR REPLACE VIEW public.scenario_pu_features_entity AS 
      SELECT pu.scenario_id, pu.id AS scenario_pu_id, string_agg(distinct species.feature_id::text, ','::text) AS feature_list
      FROM 
      (
        SELECT sfd.scenario_id, fd.the_geom as the_geom, fd.feature_id
        FROM scenario_features_data sfd
          JOIN features_data fd ON sfd.feature_class_id = fd.id
      ) species,
      (
        SELECT pug.the_geom, spd.id, spd.scenario_id
        FROM planning_units_geom pug
          JOIN scenarios_pu_data spd ON pug.id = spd.pu_geom_id
        ORDER BY spd.puid
      ) pu
      WHERE st_intersects(species.the_geom, pu.the_geom)
      GROUP BY pu.scenario_id, pu.id;
    `);
    await queryRunner.query(`
      CREATE VIEW "scenario_puvspr_geo_entity" AS
      SELECT pu.scenario_id as scenario_id, puid as pu_id, feature_id, ST_Area(ST_Transform(st_intersection(species.the_geom, pu.the_geom),3410)) AS amount
      FROM
      (
          SELECT scenario_id, the_geom, sfd.feature_id
          FROM scenario_features_data sfd
          INNER JOIN features_data fd  ON sfd.feature_class_id = fd.id
      ) species,
      (
          SELECT the_geom, spd.puid, spd.scenario_id
          FROM planning_units_geom pug
          INNER JOIN scenarios_pu_data spd ON pug.id = spd.pu_geom_id order by puid asc
      ) pu
      WHERE st_intersects(species.the_geom, pu.the_geom)
      ORDER BY puid, feature_id ASC
    `);
  }
}
