import {MigrationInterface, QueryRunner} from "typeorm";

export class ScenarioPuFeaturesForTilesView1627652172613 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DROP VIEW IF EXISTS "scenario_pu_features_entity";
    CREATE VIEW "scenario_pu_features_entity" AS
    select pu.scenario_id as scenario_id, pu.id as scenario_pu_id, string_agg(feature_id::text, ',') as feature_list
    from
     (
        select scenario_id, the_geom, fd.feature_id
        from scenario_features_data sfd
        inner join features_data fd  on sfd.feature_class_id = fd.id
    ) species,
     (
        select the_geom, spd.id, spd.scenario_id
        from planning_units_geom pug
        inner join scenarios_pu_data spd on pug.id = spd.pu_geom_id order by puid asc
    ) pu
    where st_intersects(species.the_geom, pu.the_geom)
   group by pu.scenario_id, pu.id;
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW "scenario_pu_features_entity";`);
  }
}
