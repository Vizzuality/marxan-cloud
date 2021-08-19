import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeViewScenarioPuFeatures1628277511112
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE OR REPLACE VIEW public.scenario_pu_features_entity
AS SELECT pu.scenario_id,
    pu.id AS scenario_pu_id,
    string_agg(distinct species.feature_id::text, ','::text) AS feature_list
   FROM ( SELECT sfd.scenario_id,
            (st_dump(fd.the_geom)).geom as the_geom,
            fd.feature_id
           FROM scenario_features_data sfd
             JOIN features_data fd ON sfd.feature_class_id = fd.id) species,
    ( SELECT pug.the_geom,
            spd.id,
            spd.scenario_id
           FROM planning_units_geom pug
             JOIN scenarios_pu_data spd ON pug.id = spd.pu_geom_id
          ORDER BY spd.puid) pu
  WHERE st_intersects(species.the_geom, pu.the_geom)
  GROUP BY pu.scenario_id, pu.id;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE OR REPLACE VIEW public.scenario_pu_features_entity
AS SELECT pu.scenario_id,
    pu.id AS scenario_pu_id,
    string_agg(distinct species.feature_id::text, ','::text) AS feature_list
   FROM ( SELECT sfd.scenario_id,
            fd.the_geom as the_geom,
            fd.feature_id
           FROM scenario_features_data sfd
             JOIN features_data fd ON sfd.feature_class_id = fd.id) species,
    ( SELECT pug.the_geom,
            spd.id,
            spd.scenario_id
           FROM planning_units_geom pug
             JOIN scenarios_pu_data spd ON pug.id = spd.pu_geom_id
          ORDER BY spd.puid) pu
  WHERE st_intersects(species.the_geom, pu.the_geom)
  GROUP BY pu.scenario_id, pu.id;
      `);
  }
}
