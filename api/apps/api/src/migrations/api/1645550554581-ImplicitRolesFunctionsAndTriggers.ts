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
    CREATE TYPE user_and_role AS ( user_id uuid, role_id varchar);
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
          C as (
            SELECT scenario_id FROM users_scenarios us WHERE us.user_id = $1 AND is_implicit IS true
          ),
          G as (
            SELECT * FROM P EXCEPT SELECT * FROM E
          ),
		      GR as (
			      SELECT s.id, up.role_id as role_id FROM G
              LEFT OUTER JOIN scenarios s ON G.id = s.id
              JOIN projects pro ON s.project_id = pro.id
              JOIN users_projects up ON up.project_id = pro.id AND up.user_id = $1
          ),
          R as (
            SELECT * FROM C EXCEPT SELECT * FROM G
          )
        SELECT array((SELECT (id, regexp_replace(role_id, '^project_', 'scenario_'))::role_on_entity FROM GR)) AS grant_on, array((SELECT * FROM R)) AS revoke_on;
        $$ LANGUAGE 'sql';
    `);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION apply_scenario_acl_diff_for_user(_user_id uuid, grant_on role_on_entity[], revoke_on uuid[]) RETURNS void as $$
    DECLARE
      grant_on_scenario role_on_entity;
      revoke_on_scenario uuid;
    BEGIN
      FOREACH grant_on_scenario IN array grant_on
      LOOP
        RAISE NOTICE 'Granting implicit % role on scenario % to user %', grant_on_scenario.role_id, grant_on_scenario.entity_id, _user_id;

        -- first delete, then redo - this is so that we can easily reflect a
        -- change on user role on the parent project
        DELETE FROM users_scenarios WHERE user_id = _user_id AND scenario_id = grant_on_scenario.entity_id AND is_implicit IS true;
        INSERT INTO users_scenarios
          (user_id, scenario_id, role_id, is_implicit)
          VALUES
          (_user_id, grant_on_scenario.entity_id, grant_on_scenario.role_id, true);
      END LOOP;

      FOREACH revoke_on_scenario IN array revoke_on
      LOOP
        RAISE NOTICE 'Revoking implicit role on scenario % from user %', revoke_on_scenario, _user_id;

        DELETE FROM users_scenarios us
          WHERE us.user_id = _user_id AND scenario_id = revoke_on_scenario;
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
        user_id uuid;
        is_implicit boolean;
      BEGIN
        -- set user_id from row being created or deleted,
        -- as applicable
        IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
            user_id := NEW.user_id;
        ELSIF TG_OP = 'DELETE' THEN
            user_id := OLD.user_id;
        END IF;

        PERFORM apply_scenario_acl_diff_for_user(
          user_id,
          (select grant_on from compute_implicit_scenario_roles_for_user(user_id)),
          (select revoke_on from compute_implicit_scenario_roles_for_user(user_id))
        );

        IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
          RETURN NEW;
        END IF;

        IF TG_OP = 'DELETE' THEN
          RETURN OLD;
        END IF;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION manage_existing_project_roles_for_scenario()
      RETURNS trigger as $$
      DECLARE
        users_to_grant user_and_role[];
        parent_project_id uuid;
        new_scenario_id uuid;
        user_to_grant user_and_role;
      BEGIN
        parent_project_id := NEW.project_id;
        new_scenario_id := NEW.id;
        users_to_grant := ARRAY(SELECT ROW(user_id, role_id) FROM users_projects up WHERE up.project_id = parent_project_id);
          
        FOREACH user_to_grant IN array users_to_grant
        LOOP
          RAISE NOTICE 'Granting implicit % role on scenario % to user %', regexp_replace(user_to_grant.role_id, '^project_', 'scenario_'), new_scenario_id, user_to_grant.user_id;

          DELETE FROM users_scenarios WHERE user_id = user_to_grant.user_id AND scenario_id = new_scenario_id;
          INSERT INTO users_scenarios
            (user_id, scenario_id, role_id, is_implicit)
            VALUES
            (user_to_grant.user_id, new_scenario_id, regexp_replace(user_to_grant.role_id, '^project_', 'scenario_'), true);
        END LOOP;
	      RETURN NULL;
      END;
      $$ LANGUAGE 'plpgsql';
    `);

    await queryRunner.query(`
      -- triggers for implicit scenario roles
      CREATE OR REPLACE TRIGGER compute_implicit_scenario_roles_for_projects
      AFTER INSERT OR UPDATE OR DELETE ON users_projects
      FOR EACH ROW
      EXECUTE PROCEDURE manage_implicit_scenario_roles();

      CREATE OR REPLACE TRIGGER compute_implicit_scenario_roles_for_scenarios
      AFTER INSERT ON scenarios
      FOR EACH ROW
      EXECUTE PROCEDURE manage_existing_project_roles_for_scenario();
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TRIGGER IF EXISTS compute_implicit_scenario_roles_for_projects ON users_scenarios;

        DROP FUNCTION IF EXISTS manage_implicit_scenario_roles();

        DROP FUNCTION IF EXISTS apply_scenarios_acl_for_user(uuid, role_on_entity[], varchar);

        DROP FUNCTION IF EXISTS compute_implicit_scenario_roles_for_user(uuid);

        DROP TYPE IF EXISTS role_on_entity;

        ALTER TABLE users_scenarios
        DROP COLUMN is_implicit;

        ALTER TABLE users_scenarios
        ADD COLUMN is_editing boolean NOT NULL DEFAULT false;
  `);
  }
}
