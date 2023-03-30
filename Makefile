.PHONY: start

# Read values as needed from .env
# If using the same variables in recipes that need to use a dotenv file other
# than .env, remember to check that no values from .env are being used
# inadvertently.
ENVFILE := $(if $(environment), .env-test-e2e, .env)
ifneq (,$(wildcard $(ENVFILE)))
    include $(ENVFILE)
    export
endif

# use compose plugin if available, fall back to docker-compose standalone
DOCKER_COMPOSE_STANDALONE_EXISTS := $(shell docker-compose version 2>/dev/null)
DOCKER_COMPOSE_PLUGIN_EXISTS := $(shell docker compose version 2>/dev/null)

ifdef DOCKER_COMPOSE_PLUGIN_EXISTS
DOCKER_COMPOSE_COMMAND := docker compose
else
ifdef DOCKER_COMPOSE_STANDALONE_EXISTS
DOCKER_COMPOSE_COMMAND := docker-compose
else
$(error Please install either the Compose plugin for Docker or the Docker Compose standalone binary)
endif
endif

CIENV := $(if $(filter $(environment), ci), -f docker-compose-test-e2e.ci.yml , -f docker-compose-test-e2e.local.yml)
API_DB_INSTANCE := $(if $(environment), test-e2e-postgresql-api, postgresql-api)
GEO_DB_INSTANCE := $(if $(environment), test-e2e-postgresql-geo-api, postgresql-geo-api)
REDIS_INSTANCE := $(if $(environment), test-e2e-redis, redis)

DOCKER_COMPOSE_FILE := $(if $(environment), -f docker-compose-test-e2e.yml $(CIENV), -f docker-compose.yml )
DOCKER_CLEAN_VOLUMES := $(if $(environment), , \
	docker volume rm -f marxan-cloud_marxan-cloud-postgresql-api-data && \
	docker volume rm -f marxan-cloud_marxan-cloud-postgresql-geo-data && \
	docker volume rm -f marxan-cloud_marxan-cloud-redis-api-data )
COMPOSE_PROJECT_NAME := marxan-cloud

## some color to give live to the outputs
RED :=\033[1;32m
NC :=\033[0m # No Color

test-commands:
	@echo $(ENVFILE)
	@echo $(DOCKER_COMPOSE_FILE)
	@echo $(CIENV)
	@echo $(API_POSTGRES_DB)
	@echo $(GEO_POSTGRES_USER)

# Start only API and Geoprocessing services
#
# Useful when developing on API components only, to avoid spinning up services
# which may not be needed.
start-api:
	$(DOCKER_COMPOSE_COMMAND) --project-name ${COMPOSE_PROJECT_NAME} up --build api geoprocessing webshot

# Start backend services in debug mode (listening on inspector port)
debug-api:
	ENABLE_DEBUG_MODE=true $(DOCKER_COMPOSE_COMMAND) --project-name ${COMPOSE_PROJECT_NAME} up --build api geoprocessing
	
# Start all the services.
start:
	$(DOCKER_COMPOSE_COMMAND) --project-name ${COMPOSE_PROJECT_NAME} up --build

notebooks:
	$(DOCKER_COMPOSE_COMMAND) --project-name ${COMPOSE_PROJECT_NAME} -f ./data/docker-compose.yml up --build

notebooks-stop:
	$(DOCKER_COMPOSE_COMMAND) -f ./data/docker-compose.yml stop

stop:
	$(DOCKER_COMPOSE_COMMAND) $(DOCKER_COMPOSE_FILE) stop

psql-api:
	$(DOCKER_COMPOSE_COMMAND) $(DOCKER_COMPOSE_FILE) exec $(API_DB_INSTANCE) psql -U "${API_POSTGRES_USER}"

psql-geo:
	$(DOCKER_COMPOSE_COMMAND) $(DOCKER_COMPOSE_FILE) exec $(GEO_DB_INSTANCE) psql -U "${GEO_POSTGRES_USER}"

redis-api:
	$(DOCKER_COMPOSE_COMMAND) exec redis redis-cli

start-redis-commander:
	$(DOCKER_COMPOSE_COMMAND) up --build redis-commander

# Stop all containers and remove the postgresql-api container and the named
# Docker volume used to persists PostgreSQL data
#
# The use of `-f` flags in the `docker-compose rm` and `docker volume rm`
# commands is to ignore errors if the container or volume being deleted
# don't actually exist.
clean-slate-full-stop-and-cleanup:
	$(DOCKER_COMPOSE_COMMAND) $(DOCKER_COMPOSE_FILE) down --volumes --remove-orphans
	$(DOCKER_COMPOSE_COMMAND) $(DOCKER_COMPOSE_FILE) rm -f -v

clean-slate: stop clean-slate-full-stop-and-cleanup
	$(DOCKER_CLEAN_VOLUMES)

test-clean-slate: clean-slate-full-stop-and-cleanup

# setup full testing data
seed-dbs: seed-api-with-test-data

seed-api-with-test-data: seed-api-init-data | seed-geoapi-init-data
	@echo "$(RED)seeding db with testing project and scenarios:$(NC) $(API_DB_INSTANCE)"
	$(DOCKER_COMPOSE_COMMAND) $(DOCKER_COMPOSE_FILE) exec -T $(API_DB_INSTANCE) psql -U "${API_POSTGRES_USER}" < api/apps/api/test/fixtures/test-data.sql

seed-api-init-data:
	@echo "$(RED)seeding initial dbs:$(NC) $(API_DB_INSTANCE)"
	$(DOCKER_COMPOSE_COMMAND) $(DOCKER_COMPOSE_FILE) exec -T $(API_DB_INSTANCE) psql -U "${API_POSTGRES_USER}" < api/apps/api/test/fixtures/test-init-apidb.sql

seed-geoapi-init-data:
	@echo "$(RED)seeding dbs with initial geodata:$(NC) $(API_DB_INSTANCE), $(GEO_DB_INSTANCE)"
	sed -e "s/\$$user/00000000-0000-0000-0000-000000000000/g" api/apps/api/test/fixtures/test-admin-data.sql | $(DOCKER_COMPOSE_COMMAND) $(DOCKER_COMPOSE_FILE) exec -T $(GEO_DB_INSTANCE) psql -U "${GEO_POSTGRES_USER}"; \
	sed -e "s/\$$user/00000000-0000-0000-0000-000000000000/g" api/apps/api/test/fixtures/test-wdpa-data.sql | $(DOCKER_COMPOSE_COMMAND) $(DOCKER_COMPOSE_FILE) exec -T $(GEO_DB_INSTANCE) psql -U "${GEO_POSTGRES_USER}";
	$(DOCKER_COMPOSE_COMMAND) $(DOCKER_COMPOSE_FILE) exec -T $(API_DB_INSTANCE) psql -U "${API_POSTGRES_USER}" < api/apps/api/test/fixtures/test-features.sql
	@for i in api/apps/api/test/fixtures/features/*.sql; do \
		table_name=`basename -s .sql "$$i"`; \
		featureid=`$(DOCKER_COMPOSE_COMMAND) $(DOCKER_COMPOSE_FILE) exec -T $(API_DB_INSTANCE) psql -X -A -t -U "${API_POSTGRES_USER}" -c "select id from features where feature_class_name = '$$table_name'"`; \
		echo "appending data for $${table_name} with id $${featureid}"; \
		sed -e "s/\$$feature_id/$$featureid/g" api/apps/api/test/fixtures/features/$${table_name}.sql | $(DOCKER_COMPOSE_COMMAND) $(DOCKER_COMPOSE_FILE) exec -T $(GEO_DB_INSTANCE) psql -U "${GEO_POSTGRES_USER}"; \
		done;

# need notebook service to execute a specific notebook. this requires a full geodb
generate-geo-test-data: extract-geo-test-data
	$(DOCKER_COMPOSE_COMMAND) --project-name ${COMPOSE_PROJECT_NAME} -f ./data/docker-compose.yml exec marxan-science-notebooks papermill --progress-bar --log-output work/notebooks/Lab/convert_csv_sql.ipynb /dev/null
	mv -f -u -Z data/data/processed/test-wdpa-data.sql api/apps/api/test/fixtures/test-wdpa-data.sql
	mv -f -u -Z data/data/processed/test-admin-data.sql api/apps/api/test/fixtures/test-admin-data.sql
	mv -f -u -Z data/data/processed/test-features.sql api/apps/api/test/fixtures/test-features.sql
	rm -rf api/apps/api/test/fixtures/features && mv -f -u -Z data/data/processed/features api/apps/api/test/fixtures/features

# Don't forget to run make clean-slate && make start-api before repopulating the
# whole db. This will delete all existing data and create tables/views/etc.
# through the migrations that run when starting up the API service.
#
# No users are needed for this seed operation, strictly speaking, as
# ETL-imported data is "associated" to a dummy userid (UUID zero).
seed-geodb-data:
	$(DOCKER_COMPOSE_COMMAND) --project-name ${COMPOSE_PROJECT_NAME} -f ./data/docker-compose-data_management.yml up --build marxan-seed-data

# Same as seed-geodb-data, but it also creates a handful of users with hardcoded
# passwords (not recommended for anything else than dev environments).
seed-geodb-data-plus-initial-test-users: seed-api-init-data seed-geodb-data

test-start-services: clean-slate
	@echo "$(RED)Mounting docker file:$(NC) docker-compose-test-e2e.yml / docker-compose-test-e2e.local.yml"
	# start from clean slate, in case anything was left around from previous runs (mostly relevant locally, not in CI) and spin the instances (geoprocessing, api and the DBs)
	$(DOCKER_COMPOSE_COMMAND) $(DOCKER_COMPOSE_FILE) --project-name ${COMPOSE_PROJECT_NAME} up -d --build api geoprocessing && \
	$(DOCKER_COMPOSE_COMMAND) $(DOCKER_COMPOSE_FILE) exec -T api ./apps/api/entrypoint.sh run-migrations-for-e2e-tests && \
	$(DOCKER_COMPOSE_COMMAND) $(DOCKER_COMPOSE_FILE) exec -T geoprocessing ./apps/geoprocessing/entrypoint.sh run-migrations-for-e2e-tests

seed-dbs-e2e: test-start-services
	$(MAKE) seed-api-with-test-data

# Run e2e tests via
# `make test-e2e-<api|groprocessing> environment=local`
# except in GitHub Actions CI, where we use a different env setup, which relies
# on a different environment:
# `make test-e2e-<api|groprocessing> environment=ci`
test-e2e-api: test-clean-slate seed-dbs-e2e
	$(DOCKER_COMPOSE_COMMAND) $(DOCKER_COMPOSE_FILE) exec -T api ./apps/api/entrypoint.sh test-e2e
	$(MAKE) test-clean-slate

# See note for test-e2e-api above
test-e2e-geoprocessing: test-clean-slate seed-dbs-e2e
	$(DOCKER_COMPOSE_COMMAND) $(DOCKER_COMPOSE_FILE) exec -T geoprocessing ./apps/geoprocessing/entrypoint.sh test-e2e
	$(MAKE) test-clean-slate

setup-test-unit-backend:
	# build API and geoprocessing containers
	$(DOCKER_COMPOSE_COMMAND) -f docker-compose-test-unit.yml build api geoprocessing

test-unit-api:
	# run unit tests - API
	$(DOCKER_COMPOSE_COMMAND) -f docker-compose-test-unit.yml up --abort-on-container-exit --exit-code-from api api

test-unit-geo:
	# run unit tests - geoprocessing
	$(DOCKER_COMPOSE_COMMAND) -f docker-compose-test-unit.yml up --abort-on-container-exit --exit-code-from geoprocessing geoprocessing

test-unit-backend: setup-test-unit-backend test-unit-api test-unit-geo

run-test-unit:
	$(MAKE) --keep-going test-unit-backend

dump-geodb-data:
	$(DOCKER_COMPOSE_COMMAND) exec -T postgresql-geo-api pg_dump -T migrations -a -U "${GEO_POSTGRES_USER}" -F t ${GEO_POSTGRES_DB} | gzip > data/data/processed/db_dumps/geo_db-$$(date +%Y-%m-%d).tar.gz

dump-api-data:
	$(DOCKER_COMPOSE_COMMAND) exec -T postgresql-api pg_dump -T '(migrations|api_event_kinds|roles)' -a -U "${API_POSTGRES_USER}" -F t ${API_POSTGRES_DB} | gzip > data/data/processed/db_dumps/api_db-$$(date +%Y-%m-%d).tar.gz

upload-dump-data:
	az storage blob upload-batch --account-name $(DATA_SEEDS_AZURE_STORAGE_ACCOUNT_NAME) -d $(DATA_SEEDS_AZURE_STORAGE_CONTAINER_NAME)/db-dumps -s data/data/processed/db_dumps

upload-volumes-data:
	az storage blob upload-batch --account-name $(DATA_SEEDS_AZURE_STORAGE_ACCOUNT_NAME) -d $(DATA_SEEDS_AZURE_STORAGE_CONTAINER_NAME)/db-volumes -s data/data/processed/db_volumes

upload-data-for-demo:
	az storage blob upload-batch --account-name $(DATA_SEEDS_AZURE_STORAGE_ACCOUNT_NAME) -d $(DATA_SEEDS_AZURE_STORAGE_CONTAINER_NAME)/data-demo -s data/data/data_demo/organized

restore-dumps:
	$(DOCKER_COMPOSE_COMMAND) --project-name ${COMPOSE_PROJECT_NAME} -f ./data/docker-compose-data_management.yml up --build marxan-restore-data

## To generate volumes instances must be stop
create-volumes-data:
	docker run --rm --volumes-from marxan-postgresql-api -v $$(pwd)/data/data/processed/db_volumes:/backup ubuntu tar cvf /backup/psql-api-data.tar /var/lib/postgresql/data && \
	docker run --rm --volumes-from marxan-postgresql-geo-api -v $$(pwd)/data/data/processed/db_volumes:/backup ubuntu tar cvzf /backup/psql-geo-data.tar.gz /var/lib/postgresql/data

restore-volumes-data:
	docker run --rm --volumes-from marxan-postgresql-api -v $$(pwd)/data/data/processed/db_volumes:/backup ubuntu bash -c "rm -rf /var/lib/postgresql/data/* && cd / && tar xvf /backup/psql-api-data.tar" && \
	docker run --rm --volumes-from marxan-postgresql-geo-api -v $$(pwd)/data/data/processed/db_volumes:/backup ubuntu bash -c "rm -rf /var/lib/postgresql/data/* && cd / && tar xvf /backup/psql-geo-data.tar"
extract-geo-test-data:
	#This location correspond with the Okavango delta touching partially Botswana, Angola Zambia and Namibia
	TEST_GEOMETRY=$(shell cat api/apps/api/test/fixtures/test-geometry-subset.json | jq 'tostring'); \
	$(DOCKER_COMPOSE_COMMAND) exec -T postgresql-geo-api psql -U "${GEO_POSTGRES_USER}" -c "COPY (SELECT * FROM admin_regions WHERE st_intersects(the_geom, st_geomfromgeojson('$${TEST_GEOMETRY}'))) TO STDOUT DELIMITER ',' CSV HEADER;" > data/data/processed/geo_admin_regions_okavango.csv; \
	$(DOCKER_COMPOSE_COMMAND) exec -T postgresql-geo-api psql -U "${GEO_POSTGRES_USER}" -c "COPY (SELECT * FROM wdpa WHERE st_intersects(the_geom, st_geomfromgeojson('$${TEST_GEOMETRY}'))) TO STDOUT DELIMITER ',' CSV HEADER;" > data/data/processed/geo_wdpa_okavango.csv; \
	$(DOCKER_COMPOSE_COMMAND) exec -T postgresql-geo-api psql -U "${GEO_POSTGRES_USER}" -c "COPY (SELECT * FROM features_data WHERE st_intersects(the_geom, st_geomfromgeojson('$${TEST_GEOMETRY}'))) TO STDOUT DELIMITER ',' CSV HEADER;" > data/data/processed/geo_features_data_okavango.csv;
	$(DOCKER_COMPOSE_COMMAND) exec -T postgresql-api psql -U "${API_POSTGRES_USER}" -c "COPY (SELECT * FROM features) TO STDOUT DELIMITER ',' CSV HEADER;" > data/data/processed/api_features_okavango.csv

generate-content-dumps: dump-api-data | dump-geodb-data
	jq -n --arg dateName $$(date +%Y-%m-%d) '{"metadata":{"latest":{"name":$$dateName}}}' > data/data/processed/db_dumps/content.json

generate-export-shpfile:
	-$(DOCKER_COMPOSE_COMMAND) exec -T postgresql-geo-api mkdir testdataoutput2
	-$(DOCKER_COMPOSE_COMMAND) exec -T postgresql-geo-api pgsql2shp -f ./testdataoutput2/test.shp -h localhost -p 5432 -r -g the_geom -u ${GEO_POSTGRES_USER} ${GEO_POSTGRES_DB} "SELECT the_geom, pug.id as uid, 1 as cost FROM planning_units_geom pug inner join projects_pu ppu on pug.id = ppu.geom_id inner join scenarios_pu_data spd on ppu.id = spd.project_pu_id";
	-mkdir data/data
	-docker cp marxan-postgresql-geo-api:testdataoutput2 data/data

# Native support tasks


native-db-destroy:
	psql -U "${API_POSTGRES_USER}" -h "${API_POSTGRES_HOST}" -c "DROP DATABASE IF EXISTS \"${API_POSTGRES_DB}\" WITH (FORCE);"
	psql -U "${GEO_POSTGRES_USER}" -h "${GEO_POSTGRES_HOST}" -c "DROP DATABASE IF EXISTS \"${GEO_POSTGRES_DB}\" WITH (FORCE);"

# Create the API and GEO databases. Fails gracefully if the databases already exist.
native-db-create: native-db-destroy
	@echo "SELECT 'CREATE DATABASE \"${API_POSTGRES_DB}\"' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${API_POSTGRES_DB}')\gexec" | psql -U "${API_POSTGRES_USER}" -h "${API_POSTGRES_HOST}"
	@echo "SELECT 'CREATE DATABASE \"${GEO_POSTGRES_DB}\"' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${GEO_POSTGRES_DB}')\gexec" | psql -U "${GEO_POSTGRES_USER}" -h "${GEO_POSTGRES_HOST}"

# Apply migrations to the current API and GEO databases. Assumes the PostgreSQL server is up.
native-db-migrate: native-db-create
	cd api; yarn geoprocessing:typeorm migration:run -t each
	cd api; yarn api:typeorm migration:run -t each

native-seed-api-init-data:
	@echo "seeding initial dbs"
	psql -U "${API_POSTGRES_USER}" -h "${API_POSTGRES_HOST}" ${API_POSTGRES_DB} < api/apps/api/test/fixtures/test-init-apidb.sql

native-seed-geoapi-init-data:
	@echo "seeding dbs with initial geodata"
	sed -e "s/\$$user/00000000-0000-0000-0000-000000000000/g" api/apps/api/test/fixtures/test-admin-data.sql | psql -U "${GEO_POSTGRES_USER}" -h "${GEO_POSTGRES_HOST}" ${GEO_POSTGRES_DB}; \
	sed -e "s/\$$user/00000000-0000-0000-0000-000000000000/g" api/apps/api/test/fixtures/test-wdpa-data.sql | psql -U "${GEO_POSTGRES_USER}" -h "${GEO_POSTGRES_HOST}" ${GEO_POSTGRES_DB};
	psql -U "${API_POSTGRES_USER}" -h "${API_POSTGRES_HOST}" ${API_POSTGRES_DB} < api/apps/api/test/fixtures/test-features.sql
	@for i in api/apps/api/test/fixtures/features/*.sql; do \
		table_name=`basename -s .sql "$$i"`; \
		featureid=`psql -X -A -t -U "${API_POSTGRES_USER}" -h "${API_POSTGRES_HOST}" ${API_POSTGRES_DB} -c "select id from features where feature_class_name = '$$table_name'"`; \
		echo "appending data for $${table_name} with id $${featureid}"; \
		sed -e "s/\$$feature_id/$$featureid/g" api/apps/api/test/fixtures/features/$${table_name}.sql | psql -U "${GEO_POSTGRES_USER}" -h "${GEO_POSTGRES_HOST}" ${GEO_POSTGRES_DB}; \
		done;

native-seed-api-with-test-data: native-db-migrate native-seed-api-init-data | native-seed-geoapi-init-data
	psql -U "${API_POSTGRES_USER}" -h "${API_POSTGRES_HOST}" ${API_POSTGRES_DB} < api/apps/api/test/fixtures/test-data.sql

# This is a _real_ make recipe (i.e. not phony) - if .env does not exist, it
# will generate a minimal one for you, but it will not override an existing .env
# file, without forcing this (for example, via `make -B .env`)
.env:
	cat env.default | bash scripts/development-dotenv > .env
