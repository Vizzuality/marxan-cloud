import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInternalIdWithinProjectForScenario1687874141309
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE scenarios ADD COLUMN project_scenario_id integer;
      ALTER TABLE scenarios ADD CONSTRAINT unique_project_scenario_id UNIQUE(project_id, project_scenario_id),
                            ADD CONSTRAINT max_project_scenario_id CHECK (project_scenario_id >=0 and project_scenario_id <=999);

      -- trigger to set project_scenario_id on scenario inserts
      CREATE OR REPLACE FUNCTION tr_next_project_scenario_id()
      RETURNS TRIGGER AS $BODY$
      DECLARE
        next_id integer;
      BEGIN
        select COALESCE( MAX(s.project_scenario_id), 0 )+1 into next_id from scenarios s where s.project_id = NEW.project_id;
        NEW.project_scenario_id = next_id;

        RETURN NEW;
      END
      $BODY$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS tr_next_project_scenario_id_insert ON scenarios;

      CREATE TRIGGER tr_next_project_scenario_id_insert
      BEFORE INSERT ON scenarios
      FOR EACH ROW EXECUTE
      PROCEDURE tr_next_project_scenario_id();

      -- set project_scenario_id for all preexisting scenario before setting the field to NOT NULL
      DO
      $do$
      DECLARE
        scenario_record RECORD;
      BEGIN
        FOR scenario_record IN (SELECT id, project_id FROM scenarios WHERE project_scenario_id IS NULL)
        LOOP
          UPDATE scenarios
            SET project_scenario_id = (SELECT COALESCE( MAX(sub.project_scenario_id), 0 )
                                        FROM scenarios sub
                                        WHERE sub.project_id = scenario_record.project_id) + 1
            WHERE id = scenario_record.id;
        END LOOP;
      END;
      $do$ LANGUAGE plpgsql;

      ALTER TABLE scenarios ALTER COLUMN project_scenario_id SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP FUNCTION tr_next_project_scenario_id cascade;
        ALTER TABLE scenarios DROP COLUMN project_scenario_id;
    `);
  }
}

