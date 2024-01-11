import psycopg2


dry_run = False

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
cur_geo_db = geo_db.cursor()

try:

    cur_api_db.execute("BEGIN;")
    cur_geo_db.execute("BEGIN;")

    cur_geo_db.execute(''' select cspd.cost_surface_id
                        from cost_surface_pu_data cspd
                        inner join projects_pu pp on pp.id = cspd.projects_pu_id
                        group by cspd.cost_surface_id
                        having count(distinct pp.project_id) > 1 ''')
    incorrect_cost_surfaces = cur_geo_db.fetchall()

    for cost_surface in incorrect_cost_surfaces:
        cost_surface_id = cost_surface

        cur_api_db.execute( '''select project_id from cost_surfaces where id = %s ''', (cost_surface_id),)
        project = cur_api_db.fetchone()  # Retrieve the project id that the cost surface is associated to

        if project is None:
            #It can happen that the cost surface has been deleted, but there's dangling data because most probably
            #the clean up process doesn't account for this incorrect pu data that has leaked into cost_surface_pu_data
            print('Cost Surface ', cost_surface_id, ' not found on API')
            delete_incorrect_pu_data_sql = '''
                DELETE FROM cost_surface_pu_data cspd
                USING projects_pu pp
                WHERE pp.id = cspd.projects_pu_id AND cspd.cost_surface_id = %s
                RETURNING pp.project_id
            '''
            cur_geo_db.execute(delete_incorrect_pu_data_sql, (cost_surface_id))
        else:
            project_id = project
            delete_incorrect_pu_data_sql = '''
                DELETE FROM cost_surface_pu_data cspd
                USING projects_pu pp
                WHERE pp.id = cspd.projects_pu_id AND cspd.cost_surface_id = %s  AND NOT pp.project_id = %s
                RETURNING pp.project_id
            '''
            cur_geo_db.execute(delete_incorrect_pu_data_sql, (cost_surface_id, project_id))

        deleted_rows = cur_geo_db.fetchall()

        print("Successfully purged ", len(deleted_rows), " rows of incorrect pu data  for Cost Surface: ", cost_surface_id)


    if dry_run is False:
        cur_api_db.execute("COMMIT;")
        cur_geo_db.execute("COMMIT;")
    else:
        cur_api_db.execute("ROLLBACK;")
        cur_geo_db.execute("ROLLBACK;")

    print("Successfully purged all incorrect Cost Surface pu data")


except Exception as e:
    print(f"An error occurred: {e}")
    cur_api_db.execute("ROLLBACK;")
    cur_geo_db.execute("ROLLBACK;")
