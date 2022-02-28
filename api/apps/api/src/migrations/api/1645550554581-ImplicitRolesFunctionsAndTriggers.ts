import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImplicitRolesFunctionsAndTriggers1645550554581
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // remove legacy column - we never used this
    await queryRunner.query(`
      ALTER TABLE users_scenarios
        DROP COLUMN is_editing;
    `);
    await queryRunner.query(`
      ALTER TABLE users_scenarios
        ADD COLUMN is_implicit boolean NOT NULL DEFAULT false;
    `);
    await queryRunner.query(`
    CREATE TYPE role_on_entity AS ( entity_id uuid, role_id varchar);
    `);
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION compute_implicit_scenario_roles_for_user(_user_id uuid)
      RETURNS table(grant_on role_on_entity[], revoke_on uuid[]) AS $$
        WITH
          P AS (
            SELECT id FROM scenarios WHERE project_id IN (SELECT project_id FROM users_projects up WHERE up.user_id = $1)
          ),
          E as (
            SELECT scenario_id FROM users_scenarios us WHERE us.user_id = $1 AND is_implicit IS false
          ),
          I as (
            SELECT * FROM P EXCEPT SELECT * FROM E
          ),
          C as (
            SELECT scenario_id FROM users_scenarios us WHERE us.user_id = $1 AND is_implicit IS true
          ),
          -- @todo: this will need to be joined with the user role on each of the scenarios' parent project
          G as (
            SELECT * FROM I EXCEPT SELECT * FROM C
          ),
		      J as (
			      SELECT s.id, up.role_id as role_id FROM G * LEFT OUTER JOIN scenarios s ON G.id = s.id JOIN projects pro ON s.id = pro.id JOIN users_projects up ON up.project_id = pro.id AND up.user_id = $1
          ),
          R as (
            SELECT * FROM C EXCEPT SELECT * FROM I
          )
        SELECT array((SELECT (id, role_id)::role_on_entity FROM J)) AS grant_on, array((SELECT * FROM R)) AS revoke_on;
        $$ LANGUAGE 'sql';
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION apply_scenario_acl_diff_for_user(_user_id uuid, grant_on role_on_entity[], revoke_on (uuid[] ) RETURNS void as $$
      DECLARE
        grant_on_scenario_id role_on_entity;
        revoke_on_scenario_id uuid;
      BEGIN
        FOREACH grant_on_scenario IN array grant_on
        LOOP
          RAISE NOTICE 'Granting implicit % role on scenario % to user %', grant_on_scenario.role_id, grant_on_scenario.scenario_id, _user_id;

          INSERT INTO users_scenarios
            (user_id, scenario_id, role_id, is_implicit)
            VALUES
            (_user_id, grant_on_scenario.scenario_id, grant_on_scenario.role_id, true);
        END LOOP;

        FOREACH revoke_on_scenario_id IN array revoke_on
        LOOP
          RAISE NOTICE 'Revoking implicit role on scenario % from user %', revoke_on_scenario_id, _user_id;

          DELETE FROM users_scenarios us
            WHERE us.user_id = _user_id AND scenario_id = revoke_on_scenario_id;
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
        is_implicit boolean;
        role_name varchar;
      BEGIN
        -- define constants
        -- set is_implicit to false as default
        is_implicit := false;

        -- set user_id and is_implicit from row being created or deleted,
        -- as applicable
        IF TG_OP = 'INSERT' THEN
          user_id := NEW.user_id;
          IF TG_TABLE_NAME = 'users_projects' THEN
            is_implicit := NEW.is_implicit;
          END IF;
        ELSIF TG_OP = 'DELETE' THEN
            user_id := OLD.user_id;
            IF TG_TABLE_NAME = 'users_projects' THEN
              is_implicit := OLD.is_implicit;
            END IF;
        END IF;

        PERFORM apply_scenario_acl_diff_for_user(user_id, (select grant_on from compute_implicit_scenario_roles_for_user(user_id)));

        IF TG_OP = 'INSERT' THEN
          RETURN NEW;
        END IF;

        IF TG_OP = 'DELETE' THEN
          RETURN OLD;
        END IF;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION change_implicit_scenario_role_to_explicit()
        RETURNS trigger AS
      $$
      -- If we are handling an INSERT for a new explicit role that should
        -- replace an existing implicit role, we simply flip the is_implicit
        -- column to false
      BEGIN
        IF EXISTS (SELECT 1 FROM users_scenarios WHERE user_id = NEW.user_id AND scenario_id = NEW.scenario_id) THEN
          IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'users_scenarios' AND NEW.is_implicit IS FALSE THEN
            UPDATE users_scenarios SET
              is_implicit = FALSE
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
      AFTER INSERT OR DELETE ON users_projects
      FOR EACH ROW
      EXECUTE PROCEDURE manage_implicit_scenario_roles();

      CREATE OR REPLACE TRIGGER compute_implicit_scenario_roles_for_scenarios
      AFTER DELETE ON users_scenarios
      FOR EACH ROW
      EXECUTE PROCEDURE manage_implicit_scenario_roles();

      CREATE OR REPLACE TRIGGER change_implicit_scenario_role_to_explicit
      BEFORE INSERT ON users_scenarios
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
