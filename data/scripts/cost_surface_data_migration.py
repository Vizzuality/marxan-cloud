import psycopg2

# Connect to Database 1
api_db = psycopg2.connect(
    host="localhost",
    database="marxan-api",
    user="marxan-api",
    password="marxan-api",
    port=3432
)

# Connect to Database 2
geo_db = psycopg2.connect(
    host="localhost",
    database="marxan-geo-api",
    user="marxan-geo-api",
    password="marxan-geo-api",
    port=3433
)

# Initialize the cursor for api_db
cur_api_db = api_db.cursor()

try:

    cur_api_db.execute("BEGIN;")

    alter_table_sql = '''
    ALTER TABLE scenarios
    ADD COLUMN cost_surface_id UUID
    '''

    cur_api_db.execute(alter_table_sql)

    # Retrieve all scenarios
    cur_api_db.execute("SELECT id, name, project_id FROM scenarios;")
    all_scenarios = cur_api_db.fetchall()

    for scenario in all_scenarios:
        scenario_id, scenario_name, project_id = scenario

        # Insert new row in cost_surfaces
        insert_cost_surface_sql = '''
        INSERT INTO cost_surfaces (id, name, min, max, is_default, project_id)
        VALUES (gen_random_uuid(), %s, 0, 0, false, %s)
        RETURNING id;
        '''

        cur_api_db.execute(insert_cost_surface_sql, (scenario_name, project_id))
        cost_surface_id = cur_api_db.fetchone()[0]  # Retrieve the unique id for this new cost_surface

        # Update scenarios.cost_surface_id for this specific scenario
        update_scenario_sql = '''
        UPDATE scenarios
        SET cost_surface_id = %s
        WHERE id = %s;
        '''

        cur_api_db.execute(update_scenario_sql, (cost_surface_id, scenario_id))

    # Retrieve all projects
    cur_api_db.execute("SELECT id FROM projects;")
    all_projects = cur_api_db.fetchall()

    for project in all_projects:
        project_id = project[0]

        # Insert new row in cost_surfaces with project-specific information
        insert_cost_surface_for_project_sql = '''
        INSERT INTO cost_surfaces (id, project_id, min, max, is_default, name)
        VALUES (gen_random_uuid(), %s, 1, 1, true, 'default');
        '''

        cur_api_db.execute(insert_cost_surface_for_project_sql, (project_id,))

    alter_table_sql2 = '''ALTER TABLE scenarios
        ALTER COLUMN cost_surface_id SET NOT NULL, ADD CONSTRAINT fk_cost_surface FOREIGN KEY (cost_surface_id) REFERENCES cost_surfaces(id)'''
    cur_api_db.execute(alter_table_sql2)
    cur_api_db.execute("COMMIT;")
    print("Successfully migrated data from marxan-api for:")
    print(len(all_scenarios), "scenarios")
    print(len(all_projects), "projects")
except Exception as e:
    print(e)
    cur_api_db.execute("ROLLBACK;")

cur_geo_db = geo_db.cursor()

try:
    # Start transactions for both databases
    cur_api_db.execute("BEGIN;")
    cur_geo_db.execute("BEGIN;")

    # Retrieve all scenarios
    cur_api_db.execute("SELECT id, cost_surface_id FROM scenarios;")
    all_scenarios = cur_api_db.fetchall()
    orphan_scenario_ids = []

    for scenario in all_scenarios:
        scenario_id, cost_surface_id = scenario

        # Calculate min and max using the geo_db
        cur_geo_db.execute(f"""
            SELECT MIN(spcd.cost) as min, MAX(spcd.cost) as max
            FROM scenarios_pu_data spd
            LEFT JOIN scenarios_pu_cost_data spcd on spd.id = spcd.scenarios_pu_data_id
            WHERE spd.scenario_id = '{scenario_id}';
        """)
        min_max = cur_geo_db.fetchone()
        min_val, max_val = min_max if min_max else (None, None)

        # If min and max are null, remove scenario and cost_surface from api_db
        if min_val is None or max_val is None:
            cur_api_db.execute("DELETE FROM scenarios WHERE id = %s;", (scenario_id,))
            cur_api_db.execute("DELETE FROM cost_surfaces WHERE id = %s;", (cost_surface_id,))
            orphan_scenario_ids.append(scenario_id)
        else:
            # Update min and max in the cost_surfaces table in the api_db
            cur_api_db.execute("""
                UPDATE cost_surfaces
                SET min = %s, max = %s
                WHERE id = %s;
            """, (min_val, max_val, cost_surface_id))

    cur_api_db.execute("SELECT id FROM projects;")
    all_projects = cur_api_db.fetchall()

    for project in all_projects:
        project_id = project[0]

        # Get the cost_surface_id where is_default = True for each project
        cur_api_db.execute("SELECT id FROM cost_surfaces WHERE project_id = %s AND is_default = True;", (project_id,))
        cost_surface = cur_api_db.fetchone()

        # Insert data into cost_surface_pu_data
        cur_geo_db.execute(f"""
                   INSERT INTO cost_surface_pu_data (puid, cost, cost_surface_id)
                   SELECT ppu.id, round(pug.area / 1000000) as area, '{cost_surface_id}'
                   FROM projects_pu ppu
                   INNER JOIN planning_units_geom pug ON pug.id = ppu.geom_id
                   WHERE ppu.project_id = '{project_id}';
               """)

        # Get min and max from cost_surface_pu_data
        cur_geo_db.execute(f"""
                   SELECT MIN(cspd.cost) as min, MAX(cspd.cost) as max
                   FROM cost_surface_pu_data cspd
                   WHERE cspd.cost_surface_id = '{cost_surface_id}';
               """)
        min_max = cur_geo_db.fetchone()
        min_val, max_val = min_max if min_max else (None, None)

        # Update min and max in cost_surfaces table in api_db
        if min_val is not None and max_val is not None:
            cur_api_db.execute("""
                       UPDATE cost_surfaces
                       SET min = %s, max = %s
                       WHERE id = %s;
                   """, (min_val, max_val, cost_surface_id))

    # Commit transactions
    cur_api_db.execute("COMMIT;")
    cur_geo_db.execute("COMMIT;")
    print("Successfully migrated data from marxan-geo-api for:")
    print('Found' + len(orphan_scenario_ids) + 'orphan scenarios:', orphan_scenario_ids)
    print(len(all_scenarios) - len(orphan_scenario_ids), "scenarios")
    print(len(all_projects), "projects")

except Exception as e:
    print(f"An error occurred: {e}")
    cur_api_db.execute("ROLLBACK;")
    cur_geo_db.execute("ROLLBACK;")
