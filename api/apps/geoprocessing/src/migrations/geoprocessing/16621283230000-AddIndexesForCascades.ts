import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexesForCascades16621283230000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create index scenarios_pu_data__project_pu_id__idx on scenarios_pu_data(project_pu_id);
    `);

    await queryRunner.query(`
      create index scenarios_pu_cost_data__scenarios_pu_data__idx on scenarios_pu_cost_data (scenarios_pu_data_id);
    `);

    await queryRunner.query(`
      create index features_data__projects_pu__idx on features_data(project_pu_id);
    `);

    await queryRunner.query(`
      create index puvpsr_calculations__projects_pu__idx on puvspr_calculations(project_pu_id);
    `);

    // rename a column to stick to conventions, while we are fiddling with these tables
    await queryRunner.query(`
      alter table output_scenarios_features_data rename column feature_scenario_id to scenario_features_id;
    `);

    await queryRunner.query(`
      create index output_scenarios_features_data__scenario_features_data__idx on output_scenarios_features_data(scenario_features_id);
    `);

    // and index in the table we are about to reference via a new fk, for
    // indexed resolution of cascades
    await queryRunner.query(`
      create index output_scenarios_pu_data__scenarios_pu_data__idx on output_scenarios_pu_data(scenario_pu_id);
    `);

    // add missing fk, running some garbage collection first
    await queryRunner.query(`
      delete from
        output_scenarios_pu_data
      where
        scenario_pu_id
      in
        (select
          distinct scenario_pu_id
        from
          output_scenarios_pu_data
        except
        select
          id
        from
          scenarios_pu_data);

      alter table
        output_scenarios_pu_data
      add constraint
        "output_scenarios_pu_data__scenarios_pu_data_id__fk"
      foreign key (scenario_pu_id)
      references
        scenarios_pu_data(id)
      on update cascade on delete cascade;
    `);

    await queryRunner.query(`
      alter table output_scenarios_features_data
        rename constraint
      "output_feature_scenariofk"
        to
      "output_scenarios_features_data__scenario_features_data__fk";
    `);

    await queryRunner.query(`
      create index projects_pu__planning_units_geom__idx on projects_pu(geom_id, geom_type);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop index projects_pu__planning_units_geom__idx;
    `);

    await queryRunner.query(`
      alter table output_scenarios_features_data
        rename constraint
        "output_scenarios_features_data__scenario_features_data__fk"
      to
        "output_feature_scenariofk";
    `);

    await queryRunner.query(`
      alter table
        output_scenarios_pu_data
      drop constraint
        "output_scenarios_pu_data__scenarios_pu_data_id__fk";
    `);

    await queryRunner.query(`
      drop index output_scenarios_pu_data__scenarios_pu_data__idx;
    `);

    await queryRunner.query(`
      drop index output_scenarios_features_data__scenario_features_data__idx;
    `);

    await queryRunner.query(`
      drop index puvpsr_calculations__projects_pu__idx;
    `);

    await queryRunner.query(`
      drop index features_data__projects_pu__idx;
    `);

    await queryRunner.query(`
      drop index scenarios_pu_cost_data__scenarios_pu_data__idx;
    `);

    await queryRunner.query(`
      drop index scenarios_pu_data__project_pu_id__idx;
    `);
  }
}
