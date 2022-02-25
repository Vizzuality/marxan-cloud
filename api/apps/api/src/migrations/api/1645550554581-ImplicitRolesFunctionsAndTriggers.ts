import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImplicitRolesFunctionsAndTriggers1645550554581
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(``);
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION compute_implicit_scenario_roles_for_user(_scenario_id uuid)
      RETURNS table(grant_on uuid[]) AS $$
        WITH
          O AS (
            SELECT id FROM users WHERE id IN (SELECT user_id FROM users_projects project_user WHERE project_id IN (SELECT project_id FROM scenarios WHERE scenarios.id = $1))
          )
        SELECT array((SELECT * FROM O)) AS grant_on;
        $$ LANGUAGE 'sql';
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION apply_scenarios_acl_for_user(_scenario_id uuid, grant_on uuid[], role_name varchar) RETURNS void as $$
      DECLARE
        grant_on_user_id uuid;
      BEGIN
        FOREACH grant_on_user_id IN array grant_on
        LOOP
          RAISE NOTICE 'Granting implicit % role on scenario % to user %', role_name, _scenario_id, grant_on_user_id;

          INSERT INTO users_scenarios
            (user_id, scenario_id, role_id)
            VALUES
            (grant_on_user_id, _scenario_id, , (SELECT name from roles WHERE name = role_name), true);

        END LOOP;
      END;
      $$ LANGUAGE 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION manage_implicit_scenario_roles()
        RETURNS trigger AS
      $$
      DECLARE
        scenario_id uuid;
        role_name varchar;
      BEGIN
        -- define constants
        role_name := 'scenario_viewer';

        IF TG_OP = 'INSERT' THEN
          user_id := NEW.user_id;
        END IF;

        PERFORM apply_scenario_acl_diff_for_user(scenario_id, (select grant_on from compute_implicit_scenario_roles_for_user(scenario_id)), role_name);

        IF TG_OP = 'INSERT' THEN
          RETURN NEW;
        END IF;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION change_implicit_scenario_role_to_explicit()
        RETURNS trigger AS
      $$
      BEGIN
        IF EXISTS (SELECT 1 FROM users_scenarios WHERE user_id = NEW.user_id AND scenario_id = NEW.scenario_id) THEN
          IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'users_scenarios' THEN
            UPDATE users_scenarios SET
              role_id = NEW.role_id
              WHERE user_id = NEW.user_id AND scenario_id = NEW.scenario_id;
            RETURN NULL;
          END IF;
        END IF;

        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    await queryRunner.query(`
      -- triggers for implicit scenario roles
      CREATE OR REPLACE TRIGGER compute_implicit_scenario_roles_for_projects
      AFTER DELETE ON users_scenarios
      FOR EACH ROW
      EXECUTE PROCEDURE manage_implicit_scenario_roles();

      CREATE OR REPLACE TRIGGER change_implicit_scenario_role_to_explicit
      AFTER INSERT ON users_scenarios
      FOR EACH ROW
      EXECUTE PROCEDURE change_implicit_scenario_role_to_explicit();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TRIGGER IF EXISTS compute_implicit_scenario_roles_for_projects ON users_scenarios;
        DROP TRIGGER IF EXISTS change_implicit_scenario_role_to_explicit ON users_scenarios;

        DROP FUNCTION IF EXISTS change_implicit_scenario_role_to_explicit();

        DROP FUNCTION IF EXISTS manage_implicit_scenario_roles();

        DROP FUNCTION IF EXISTS apply_scenarios_acl_for_user(uuid, uuid[], varchar);

        DROP FUNCTION IF EXISTS compute_implicit_scenario_roles_for_user(uuid);
  `);
  }
}
