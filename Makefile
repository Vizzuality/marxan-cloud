.PHONY: start

# Read values as needed from .env
# If using the same variables in recipes that need to use a dotenv file other
# than .env, remember to check that no values from .env are being used
# inadvertently.
ENVFILE := $(if $(environment), .env-test-e2e, .env)
CIENV := $(if $(filter $(environment), ci), -f docker-compose-test-e2e.ci.yml , -f docker-compose-test-e2e.local.yml)
API_DB_INSTANCE := $(if $(environment), test-e2e-postgresql-api, postgresql-api)
GEO_DB_INSTANCE := $(if $(environment), test-e2e-postgresql-geo-api, postgresql-geo-api)
REDIS_INSTANCE := $(if $(environment), test-e2e-redis, redis)
_API_POSTGRES_USER := $(if $(filter $(environment), ci),${API_POSTGRES_USER},$(shell grep -e API_POSTGRES_USER ${ENVFILE} | sed 's/^.*=//'))
_API_POSTGRES_DB := $(if $(filter $(environment), ci),${API_POSTGRES_DB},$(shell grep -e API_POSTGRES_DB ${ENVFILE} | sed 's/^.*=//'))
_GEO_POSTGRES_USER := $(if $(filter $(environment), ci),${GEO_POSTGRES_USER},$(shell grep -e GEO_POSTGRES_USER ${ENVFILE} | sed 's/^.*=//'))
_GEO_POSTGRES_DB := $(if $(filter $(environment), ci),${GEO_POSTGRES_DB},$(shell grep -e GEO_POSTGRES_DB ${ENVFILE} | sed 's/^.*=//'))

DOCKER_COMPOSE_FILE := $(if $(environment), -f docker-compose-test-e2e.yml $(CIENV), -f docker-compose.yml )
DOCKER_CLEAN_VOLUMES := $(if $(environment), , \
	docker volume rm -f marxan-cloud_marxan-cloud-postgresql-api-data && \
	docker volume rm -f marxan-cloud_marxan-cloud-postgresql-geo-data && \
	docker volume rm -f marxan-cloud_marxan-cloud-redis-api-data )
COMPOSE_PROJECT_NAME := "marxan-cloud"

## some color to give live to the outputs
RED :=\033[1;32m
NC :=\033[0m # No Color

test-commands:
	@echo $(ENVFILE)
	@echo $(DOCKER_COMPOSE_FILE)
	@echo $(CIENV)
	@echo $(_API_POSTGRES_DB)
	@echo $(_GEO_POSTGRES_USER)

# Start only API and Geoprocessing services
#
# Useful when developing on API components only, to avoid spinning up services
# which may not be needed.
start-api:
	docker-compose --project-name ${COMPOSE_PROJECT_NAME} up --build api geoprocessing

# Start all the services.
start:
	docker-compose --project-name ${COMPOSE_PROJECT_NAME} up --build

notebooks:
	docker-compose --project-name ${COMPOSE_PROJECT_NAME} -f ./data/docker-compose.yml up --build

notebooks-stop:
	docker-compose -f ./data/docker-compose.yml stop

stop:
	docker-compose $(DOCKER_COMPOSE_FILE) stop

psql-api:
	docker-compose $(DOCKER_COMPOSE_FILE) exec $(API_DB_INSTANCE) psql -U "${_API_POSTGRES_USER}"

psql-geo:
	docker-compose $(DOCKER_COMPOSE_FILE) exec $(GEO_DB_INSTANCE) psql -U "${_GEO_POSTGRES_USER}"

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
clean-slate-full-stop-and-cleanup:
	docker-compose $(DOCKER_COMPOSE_FILE) down --volumes --remove-orphans
	docker-compose $(DOCKER_COMPOSE_FILE) rm -f -v

clean-slate: stop clean-slate-full-stop-and-cleanup
	$(DOCKER_CLEAN_VOLUMES)

test-clean-slate: clean-slate-full-stop-and-cleanup

# setup full testing data
seed-dbs: seed-api-with-test-data | seed-geoapi-with-test-data

seed-api-with-test-data: seed-api-init-data | seed-geoapi-init-data
	@echo "$(RED)seeding db with testing project and scenarios:$(NC) $(API_DB_INSTANCE)"
	docker-compose $(DOCKER_COMPOSE_FILE) exec -T $(API_DB_INSTANCE) psql -U "${_API_POSTGRES_USER}" < api/apps/api/test/fixtures/test-data.sql

seed-api-init-data:
	@echo "$(RED)seeding initial dbs:$(NC) $(API_DB_INSTANCE)"
	docker-compose $(DOCKER_COMPOSE_FILE) exec -T $(API_DB_INSTANCE) psql -U "${_API_POSTGRES_USER}" < api/apps/api/test/fixtures/test-init-apidb.sql

seed-geoapi-with-test-data:
	@echo "$(RED)seeding initial geodata for created projects and scenarios:$(NC) $(GEO_DB_INSTANCE)"
	@SCENARIOID=$(shell docker-compose $(DOCKER_COMPOSE_FILE) exec -T $(API_DB_INSTANCE) psql -X -A -t -U "${_API_POSTGRES_USER}" -c "select id from scenarios where name = 'Example scenario 1 Project 1 Org 1'"); \
	USERID=$(shell docker-compose $(DOCKER_COMPOSE_FILE) exec -T $(API_DB_INSTANCE) psql -X -A -t -U "${_API_POSTGRES_USER}" -c "select id from users limit 1"); \
	echo "appending data for scenario with id $${SCENARIOID} for user with id $${USERID}"; \
	sed -e "s/\$$user/00000000-0000-0000-0000-000000000000/g" -e "s/\$$scenario/$$SCENARIOID/g" api/apps/api/test/fixtures/test-geodata.sql | docker-compose $(DOCKER_COMPOSE_FILE) exec -T $(GEO_DB_INSTANCE) psql -U "${_GEO_POSTGRES_USER}";

seed-geoapi-init-data:
	@echo "$(RED)seeding dbs with initial geodata:$(NC) $(API_DB_INSTANCE), $(GEO_DB_INSTANCE)"
	sed -e "s/\$$user/00000000-0000-0000-0000-000000000000/g" api/apps/api/test/fixtures/test-admin-data.sql | docker-compose $(DOCKER_COMPOSE_FILE) exec -T $(GEO_DB_INSTANCE) psql -U "${_GEO_POSTGRES_USER}"; \
	sed -e "s/\$$user/00000000-0000-0000-0000-000000000000/g" api/apps/api/test/fixtures/test-wdpa-data.sql | docker-compose $(DOCKER_COMPOSE_FILE) exec -T $(GEO_DB_INSTANCE) psql -U "${_GEO_POSTGRES_USER}";
	docker-compose $(DOCKER_COMPOSE_FILE) exec -T $(API_DB_INSTANCE) psql -U "${_API_POSTGRES_USER}" < api/apps/api/test/fixtures/test-features.sql
	@for i in api/apps/api/test/fixtures/features/*.sql; do \
		table_name=`basename -s .sql "$$i"`; \
		featureid=`docker-compose $(DOCKER_COMPOSE_FILE) exec -T $(API_DB_INSTANCE) psql -X -A -t -U "${_API_POSTGRES_USER}" -c "select id from features where feature_class_name = '$$table_name'"`; \
		echo "appending data for $${table_name} with id $${featureid}"; \
		sed -e "s/\$$feature_id/$$featureid/g" api/apps/api/test/fixtures/features/$${table_name}.sql | docker-compose $(DOCKER_COMPOSE_FILE) exec -T $(GEO_DB_INSTANCE) psql -U "${_GEO_POSTGRES_USER}"; \
		done;

# need notebook service to execute a expecific notebook. this requires a full geodb
generate-geo-test-data: extract-geo-test-data
	docker-compose -f ./data/docker-compose.yml exec -T marxan-science-notebooks papermill work/notebooks/Lab/convert_csv_sql.ipynb /dev/null
	mv -f -u -Z data/data/processed/test-wdpa-data.sql api/apps/api/test/fixtures/test-wdpa-data.sql
	mv -f -u -Z data/data/processed/test-admin-data.sql api/apps/api/test/fixtures/test-admin-data.sql
	mv -f -u -Z data/data/processed/test-features.sql api/apps/api/test/fixtures/test-features.sql
	rm -rf api/apps/api/test/fixtures/features && mv -f -u -Z data/data/processed/features api/apps/api/test/fixtures/features

# Don't forget to run make clean-slate && make start-api before repopulating the whole db
# This will delete all existing data and create tables/views/etc. through the migrations that
# run when starting up the API service.
seed-geodb-data: seed-api-init-data
	docker-compose --project-name ${COMPOSE_PROJECT_NAME} -f ./data/docker-compose-data_management.yml up --build marxan-seed-data

test-start-services: clean-slate
	@echo "$(RED)Mounting docker file:$(NC) docker-compose-test-e2e.yml / docker-compose-test-e2e.local.yml"
	# start from clean slate, in case anything was left around from previous runs (mostly relevant locally, not in CI) and spin the instances (geoprocessing, api and the DBs)
	docker-compose $(DOCKER_COMPOSE_FILE) --project-name ${COMPOSE_PROJECT_NAME} up -d --build api geoprocessing && \
	docker-compose $(DOCKER_COMPOSE_FILE) exec -T api ./apps/api/entrypoint.sh run-migrations-for-e2e-tests && \
	docker-compose $(DOCKER_COMPOSE_FILE) exec -T geoprocessing ./apps/geoprocessing/entrypoint.sh run-migrations-for-e2e-tests

seed-dbs-e2e: test-start-services

test-e2e-api: seed-dbs-e2e
	docker-compose $(DOCKER_COMPOSE_FILE) exec -T api ./apps/api/entrypoint.sh test-e2e

test-e2e-geoprocessing: seed-dbs-e2e
	docker-compose $(DOCKER_COMPOSE_FILE) exec -T geoprocessing ./apps/geoprocessing/entrypoint.sh test-e2e

test-e2e-backend: test-e2e-api test-e2e-geoprocessing
	$(MAKE) test-clean-slate

run-test-e2e-local:
	$(MAKE) --keep-going test-e2e-backend environment=local

run-test-e2e-ci:
	$(MAKE) --keep-going test-e2e-backend environment=ci

setup-test-unit-backend:
	# build API and geoprocessing containers
	docker-compose -f docker-compose-test-unit.yml build api geoprocessing

test-unit-api:
	# run unit tests - API
	docker-compose -f docker-compose-test-unit.yml up --abort-on-container-exit --exit-code-from api api

test-unit-geo:
	# run unit tests - geoprocessing
	docker-compose -f docker-compose-test-unit.yml up --abort-on-container-exit --exit-code-from geoprocessing geoprocessing

test-unit-backend: setup-test-unit-backend test-unit-api test-unit-geo

run-test-unit:
	$(MAKE) --keep-going test-unit-backend

dump-geodb-data:
	docker-compose exec -T postgresql-geo-api pg_dump -T migrations -a -U "${_GEO_POSTGRES_USER}" -F t ${_GEO_POSTGRES_DB} | gzip > data/data/processed/db_dumps/geo_db-$$(date +%Y-%m-%d).tar.gz

dump-api-data:
	docker-compose exec -T postgresql-api pg_dump -T '(migrations|api_event_kinds|roles)' -a -U "${_API_POSTGRES_USER}" -F t ${_API_POSTGRES_DB} | gzip > data/data/processed/db_dumps/api_db-$$(date +%Y-%m-%d).tar.gz

upload-dump-data:
	az storage blob upload-batch --account-name marxancloudtest --auth-mode login -d data-ingestion-test-00/dbs-dumps -s data/data/processed/db_dumps

upload-volumes-data:
	az storage blob upload-batch --account-name marxancloudtest --auth-mode login -d data-ingestion-test-00/dbs-volumes -s data/data/processed/db_volumes

upload-data-for-demo:
	az storage blob upload-batch --account-name marxancloudtest --auth-mode login -d data-ingestion-test-00/data-demo -s data/data/data_demo/organized

restore-dumps:
	docker-compose --project-name ${COMPOSE_PROJECT_NAME} -f ./data/docker-compose-data_management.yml up --build marxan-restore-data

## To generate volumes instances must be stop
create-volumes-data:
	docker run --rm --volumes-from marxan-postgresql-api -v $$(pwd)/data/data/processed/db_volumes:/backup ubuntu tar cvf /backup/psql-api-data.tar /var/lib/postgresql/data && \
	docker run --rm --volumes-from marxan-postgresql-geo-api -v $$(pwd)/data/data/processed/db_volumes:/backup ubuntu tar cvzf /backup/psql-geo-data.tar.gz /var/lib/postgresql/data

restore-volumes-data:
	docker run --rm --volumes-from marxan-postgresql-api -v $$(pwd)/data/data/processed/db_volumes:/backup ubuntu bash -c "rm -rf /var/lib/postgresql/data/* && cd / && tar xvf /backup/psql-api-data.tar" && \
	docker run --rm --volumes-from marxan-postgresql-geo-api -v $$(pwd)/data/data/processed/db_volumes:/backup ubuntu bash -c "rm -rf /var/lib/postgresql/data/* && cd / && tar xvf /backup/psql-geo-data.tar"
extract-geo-test-data:
	#This location correspond with the Okavango delta touching partially Botswana, Angola Zambia and Namibia
	TEST_GEOMETRY=$(shell cat api/apps/api/test/fixtures/test-geometry.json | jq 'tostring'); \
	docker-compose exec -T postgresql-geo-api psql -U "${_GEO_POSTGRES_USER}" -c "COPY (SELECT * FROM admin_regions WHERE st_intersects(the_geom, st_geomfromgeojson('$${TEST_GEOMETRY}'))) TO STDOUT DELIMITER ',' CSV HEADER;" > data/data/processed/geo_admin_regions_okavango.csv; \
	docker-compose exec -T postgresql-geo-api psql -U "${_GEO_POSTGRES_USER}" -c "COPY (SELECT * FROM wdpa WHERE st_intersects(the_geom, st_geomfromgeojson('$${TEST_GEOMETRY}'))) TO STDOUT DELIMITER ',' CSV HEADER;" > data/data/processed/geo_wdpa_okavango.csv; \
	docker-compose exec -T postgresql-geo-api psql -U "${_GEO_POSTGRES_USER}" -c "COPY (SELECT * FROM features_data WHERE st_intersects(the_geom, st_geomfromgeojson('$${TEST_GEOMETRY}'))) TO STDOUT DELIMITER ',' CSV HEADER;" > data/data/processed/geo_features_data_okavango.csv;
	docker-compose exec -T postgresql-api psql -U "${_API_POSTGRES_USER}" -c "COPY (SELECT * FROM features) TO STDOUT DELIMITER ',' CSV HEADER;" > data/data/processed/api_features_okavango.csv

generate-content-dumps: dump-api-data | dump-geodb-data
	jq -n --arg dateName $$(date +%Y-%m-%d) '{"metadata":{"latest":{"name":$$dateName}}}' > data/data/processed/db_dumps/content.json

generate-export-shpfile:
	-docker-compose exec -T postgresql-geo-api mkdir testdataoutput2
	-docker-compose exec -T postgresql-geo-api pgsql2shp -f ./testdataoutput2/test.shp -h localhost -p 5432 -r -g the_geom -u ${_GEO_POSTGRES_USER} ${_GEO_POSTGRES_DB} "SELECT the_geom, pug.id as uid, 1 as cost  FROM scenarios_pu_data spd inner join planning_units_geom pug on pug.id = spd.pu_geom_id ";
	-mkdir data/data
	-docker cp marxan-postgresql-geo-api:testdataoutput2 data/data

