import {MigrationInterface, QueryRunner} from "typeorm";

export class marxanOutputEntities1624890503611 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
      -- Adds area column
      ALTER TABLE planning_units_geom
        ADD COLUMN area DOUBLE PRECISION GENERATED ALWAYS AS (st_area(st_transform(the_geom, 3410))) STORED;

      -- Drop output data from scenario_features_data
      ALTER TABLE scenario_features_data
        DROP COLUMN target_met;
      ALTER TABLE scenario_features_data
        ADD COLUMN feature_id SERIAL;
      ALTER TABLE scenario_features_data
        ADD CONSTRAINT feature_classfk FOREIGN KEY (feature_class_id)
            REFERENCES features_data (id)
            ON DELETE CASCADE;

      CREATE INDEX scenarios_pu_data_index ON scenarios_pu_data (puid asc, scenario_id);

      -- Drop error on cost data table
      ALTER TABLE scenarios_pu_cost_data
        DROP COLUMN output_results_data_id;

      -- Rename output_results_data
      ALTER TABLE output_results_data
        RENAME TO output_scenarios_pu_data;

      -- Redo id and fk for output_scenarios_pu_data maps r- files
      ALTER TABLE output_scenarios_pu_data
        DROP COLUMN scenario_id,
        DROP COLUMN puid,
        DROP COLUMN missing_values;

      ALTER TABLE output_scenarios_pu_data
        ADD COLUMN scenario_pu_id uuid NOT NULL;

      ALTER TABLE output_scenarios_pu_data
        ADD CONSTRAINT scenario_pufk FOREIGN KEY (scenario_pu_id)
            REFERENCES scenarios_pu_data (id)
            ON DELETE CASCADE;
      ALTER TABLE output_scenarios_pu_data
        DROP COLUMN run_id;
      ALTER TABLE output_scenarios_pu_data
        ADD COLUMN run_id int;

      ALTER TABLE output_scenarios_pu_data
        ADD CONSTRAINT value_out_chk CHECK (value = 0 or value = 1);

      CREATE INDEX output_scenarios_pu_data_idx ON output_scenarios_pu_data (scenario_pu_id);

      -- Create output feature data that maps mv - files
      CREATE TABLE "output_scenarios_features_data" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "feature_scenario_id" uuid NOT NULL,
        "run_id" int NOT NULL,
        "amount" float8,
        "occurrences" float8,
        "separation"float8,
        "target" bool,
        "mpm"float8,
        CONSTRAINT output_feature_scenariofk
          FOREIGN KEY(feature_scenario_id)
	          REFERENCES scenario_features_data(id)
            ON DELETE CASCADE
        );

      CREATE INDEX scenario_features_data_index ON scenario_features_data (feature_id asc, scenario_id);
      `,);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
      -- Drop area column
      ALTER TABLE planning_units_geom
        DROP COLUMN area;

      -- Add target_met back from scenario_features_data
      ALTER TABLE scenario_features_data
        DROP CONSTRAINT feature_id_scenario_unique
        DROP CONSTRAINT feature_classfk
        DROP COLUMN target_met float8,
        DROP COLUMN feature_id,
        ADD COLUMN target_met;

      ALTER TABLE scenarios_pu_cost_data
        ADD COLUMN output_results_data_id TYPE uuid;

      ALTER TABLE output_scenarios_pu_data
        RENAME TO output_results_data;

        ALTER TABLE output_scenarios_pu_data
        DROP CONSTRAINT scenario_pufk,
        DROP CONSTRAINT value_out_chk,
          DROP COLUMN scenario_id,
          DROP COLUMN puid,
          DROP COLUMN missing_values,
          DROP COLUMN scenario_pu_id;

        DROP INDEX output_scenarios_pu_data_idx;

        DROP TABLE output_scenarios_features_data;

      `,);
    }

}
