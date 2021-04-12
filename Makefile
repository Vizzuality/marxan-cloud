.PHONY: start

# Read values as needed from .env
# If using the same variables in recipes that need to use a dotenv file other
# than .env, remember to check that no values from .env are being used
# inadvertently.
API_POSTGRES_USER := $(shell grep -e API_POSTGRES_USER .env | sed 's/^.*=//')
API_POSTGRES_DB := $(shell grep -e API_POSTGRES_DB .env | sed 's/^.*=//')
GEO_POSTGRES_USER := $(shell grep -e GEO_POSTGRES_USER .env | sed 's/^.*=//')
GEO_POSTGRES_DB := $(shell grep -e GEO_POSTGRES_DB .env | sed 's/^.*=//')

COMPOSE_PROJECT_NAME := "marxan-cloud"

# Start only API and Geoprocessing services
#
# Useful when developing on API components only, to avoid spinning up services
# which may not be needed.
start-api:
	docker-compose --project-name ${COMPOSE_PROJECT_NAME} up --build api geoprocessing

# Start all the services.
start:
	docker-compose up --build

notebooks:
	docker-compose --project-name ${COMPOSE_PROJECT_NAME} -f ./data/docker-compose.yml up --build

notebooks-stop:
	docker-compose -f ./data/docker-compose.yml stop

stop:
	docker-compose stop

psql-api:
	docker-compose exec postgresql-api psql -U "${API_POSTGRES_USER}"

psql-geo:
	docker-compose exec postgresql-geo-api psql -U "${GEO_POSTGRES_USER}"

redis-api:
	docker-compose exec redis redis-cli

start-redis-commander:
	docker-compose up --build redis-commander
# Stop all containers and remove the postgresql-api container and the named
# Docker volume used to persists PostgreSQL data
#
# The use of `-f` flags in the `docker-compose rm` and `docker volume rm`
# commands is to ignore errors if the container or volume being deleted
# don't actually exist.
#
# @debt We should ideally avoid hardcoding volume name so that
# any changes here or in `docker-compose.yml` will not get things out of sync.
# Or add a CI test that could catch this.
clean-slate: stop
	docker-compose down --volumes --remove-orphans
	docker-compose rm -f -v
	docker volume rm -f marxan-cloud_marxan-cloud-postgresql-api-data
	docker volume rm -f marxan-cloud_marxan-cloud-postgresql-geo-data
	docker volume rm -f marxan-cloud_marxan-cloud-redis-api-data

seed-dbs: seed-api-with-test-data | seed-geoapi-with-test-data

seed-api-with-test-data:
	docker-compose exec -T postgresql-api psql -U "${API_POSTGRES_USER}" < api/test/fixtures/test-data.sql

seed-geoapi-with-test-data:
	USERID=$(shell docker-compose exec -T postgresql-api psql -X -A -t -U "${API_POSTGRES_USER}" -c "select id from users limit 1"); \
	sed -e "s/\$$user/$$USERID/g" api/test/fixtures/test-admin-data.sql | docker-compose exec -T postgresql-geo-api psql -U "${GEO_POSTGRES_USER}"; \
	sed -e "s/\$$user/$$USERID/g" api/test/fixtures/test-wdpa-data.sql | docker-compose exec -T postgresql-geo-api psql -U "${GEO_POSTGRES_USER}";
	docker-compose exec -T postgresql-api psql -U "${API_POSTGRES_USER}" < api/test/fixtures/test-features.sql
	@for i in api/test/fixtures/features/*.sql; do \
		table_name=`basename -s .sql "$$i"`; \
		featureid=`docker-compose exec -T postgresql-api psql -X -A -t -U "${API_POSTGRES_USER}" -c "select id from features where feature_class_name = '$$table_name'"`; \
		echo "appending data for $${table_name} with id $${featureid}"; \
		sed -e "s/\$$feature_id/$$featureid/g" api/test/fixtures/features/$${table_name}.sql | docker-compose exec -T postgresql-geo-api psql -U "${GEO_POSTGRES_USER}"; \
		done;



# need notebook service to execute a expecific notebook. this requires a full geodb
generate-geo-test-data: extract-geo-test-data
	docker-compose -f ./data/docker-compose.yml exec -T marxan-science-notebooks papermill work/notebooks/Lab/convert_csv_sql.ipynb /dev/null
	mv -f -u -Z data/data/processed/test-wdpa-data.sql api/test/fixtures/test-wdpa-data.sql
	mv -f -u -Z data/data/processed/test-admin-data.sql api/test/fixtures/test-admin-data.sql
	mv -f -u -Z data/data/processed/test-features.sql api/test/fixtures/test-features.sql
	rm -rf api/test/fixtures/features && mv -f -u -Z data/data/processed/features api/test/fixtures/features

# Don't forget to run make clean-slate && make start-api before repopulating the whole db
# This will delete all existing data and create tables/views/etc. through the migrations that
# run when starting up the API service.
seed-geodb-data: seed-api-with-test-data
	docker-compose --project-name ${COMPOSE_PROJECT_NAME} -f ./data/docker-compose-data_management.yml up --build marxan-seed-data

test-e2e-api:
	# start from clean slate, in case anything was left around from previous runs (mostly relevant locally, not in CI)
	docker-compose -f docker-compose-test-e2e.yml -f docker-compose-test-e2e.local.yml --env-file .env-test-e2e rm --stop --force test-e2e-postgresql-api test-e2e-postgresql-geo-api
	# build API container
	docker-compose -f docker-compose-test-e2e.yml -f docker-compose-test-e2e.local.yml --env-file .env-test-e2e build api
	# build geoprocessing container
	docker-compose -f docker-compose-test-e2e.yml -f docker-compose-test-e2e.local.yml --env-file .env-test-e2e build geoprocessing
	# run migrations - API
	docker-compose -f docker-compose-test-e2e.yml -f docker-compose-test-e2e.local.yml --env-file .env-test-e2e run api run-migrations-for-e2e-tests
	# run migrations - geoprocessing
	docker-compose -f docker-compose-test-e2e.yml -f docker-compose-test-e2e.local.yml --env-file .env-test-e2e run geoprocessing run-migrations-for-e2e-tests
	# load test data - API
	docker-compose -f docker-compose-test-e2e.yml -f docker-compose-test-e2e.local.yml --env-file .env-test-e2e exec -T test-e2e-postgresql-api psql -U "${API_POSTGRES_USER}" < api/test/fixtures/test-data.sql
	# load test data - geoprocessing db
	USERID=$(shell docker-compose -f docker-compose-test-e2e.yml -f docker-compose-test-e2e.local.yml --env-file .env-test-e2e exec -T test-e2e-postgresql-api psql -X -A -t -U "${API_POSTGRES_USER}" -c "select id from users limit 1"); \
	echo $$USERID; \
	sed -e "s/\$$user/$$USERID/g" api/test/fixtures/test-admin-data.sql | docker-compose -f docker-compose-test-e2e.yml -f docker-compose-test-e2e.local.yml --env-file .env-test-e2e exec -T test-e2e-postgresql-geo-api psql -U "${GEO_POSTGRES_USER}"; \
	sed -e "s/\$$user/$$USERID/g" api/test/fixtures/test-wdpa-data.sql | docker-compose -f docker-compose-test-e2e.yml -f docker-compose-test-e2e.local.yml --env-file .env-test-e2e exec -T test-e2e-postgresql-geo-api psql -U "${GEO_POSTGRES_USER}";
	docker-compose -f docker-compose-test-e2e.yml -f docker-compose-test-e2e.local.yml --env-file .env-test-e2e exec -T test-e2e-postgresql-api psql -U "${API_POSTGRES_USER}" < api/test/fixtures/test-features.sql
	@for i in api/test/fixtures/features/*.sql; do \
		table_name=`basename -s .sql "$$i"`; \
		featureid=`docker-compose -f docker-compose-test-e2e.yml -f docker-compose-test-e2e.local.yml --env-file .env-test-e2e exec -T test-e2e-postgresql-api psql -X -A -t -U "${API_POSTGRES_USER}" -c "select id from features where feature_class_name = '$$table_name'"`; \
		echo "appending data for $${table_name} with id $${featureid}"; \
		sed -e "s/\$$feature_id/$$featureid/g" api/test/fixtures/features/$${table_name}.sql | docker-compose -f docker-compose-test-e2e.yml -f docker-compose-test-e2e.local.yml --env-file .env-test-e2e exec -T test-e2e-postgresql-geo-api psql -U "${GEO_POSTGRES_USER}"; \
		done;
	# run tests
	docker-compose -f docker-compose-test-e2e.yml -f docker-compose-test-e2e.local.yml --env-file .env-test-e2e up --abort-on-container-exit --exit-code-from api api
	# teardown
	docker-compose -f docker-compose-test-e2e.yml -f docker-compose-test-e2e.local.yml --env-file .env-test-e2e rm --stop --force

dump-geodb-data:
	docker-compose exec -T postgresql-geo-api pg_dump -a -U "${GEO_POSTGRES_USER}" -F t ${GEO_POSTGRES_DB} | gzip > data/data/processed/db_dumps/geo_db-$$(date +%Y-%m-%d).tar.gz

dump-api-data:
	docker-compose exec -T postgresql-api pg_dump -a -U "${API_POSTGRES_USER}" -F t ${API_POSTGRES_DB} | gzip > data/data/processed/db_dumps/api_db-$$(date +%Y-%m-%d).tar.gz

upload-dump-data:
	az storage blob upload-batch --account-name marxancloudtest --auth-mode login -d data-ingestion-test-00/dbs-dumps/ -s data/data/processed/db_dumps

restore-dumps:
	docker-compose --project-name ${COMPOSE_PROJECT_NAME} -f ./data/docker-compose-data_management.yml up --build marxan-restore-data

extract-geo-test-data:
	#This location correspond with the Okavango delta touching partially Botswana, Angola Zambia and Namibia
	TEST_GEOMETRY=$(shell cat api/test/fixtures/test-geometry.json | jq 'tostring'); \
	docker-compose exec -T postgresql-geo-api psql -U "${GEO_POSTGRES_USER}" -c "COPY (SELECT * FROM admin_regions WHERE st_intersects(the_geom, st_geomfromgeojson('$${TEST_GEOMETRY}'))) TO STDOUT DELIMITER ',' CSV HEADER;" > data/data/processed/geo_admin_regions_okavango.csv; \
	docker-compose exec -T postgresql-geo-api psql -U "${GEO_POSTGRES_USER}" -c "COPY (SELECT * FROM wdpa WHERE st_intersects(the_geom, st_geomfromgeojson('$${TEST_GEOMETRY}'))) TO STDOUT DELIMITER ',' CSV HEADER;" > data/data/processed/geo_wdpa_okavango.csv; \
	docker-compose exec -T postgresql-geo-api psql -U "${GEO_POSTGRES_USER}" -c "COPY (SELECT * FROM features_data WHERE st_intersects(the_geom, st_geomfromgeojson('$${TEST_GEOMETRY}'))) TO STDOUT DELIMITER ',' CSV HEADER;" > data/data/processed/geo_features_data_okavango.csv;
	docker-compose exec -T postgresql-api psql -U "${API_POSTGRES_USER}" -c "COPY (SELECT * FROM features) TO STDOUT DELIMITER ',' CSV HEADER;" > data/data/processed/api_features_okavango.csv
