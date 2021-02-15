.PHONY: start

# Read values as needed from .env
# If using the same variables in recipes that need to use a dotenv file other
# than .env, remember to check that no values from .env are being used
# inadvertently.
API_POSTGRES_USER := $(shell grep -e API_POSTGRES_USER .env | sed 's/^.*=//')

# Start only API and Geoprocessing services
#
# Useful when developing on API components only, to avoid spinning up services
# which may not be needed.
start-api:
	docker-compose up --build api geoprocessing

# Start all the services.
start:
	docker-compose up --build

notebooks:
	docker-compose -f ./data/docker-compose.yml up --build

stop:
	docker-compose stop

psql-api:
	docker-compose exec postgresql-api psql -U "${API_POSTGRES_USER}"

psql-geo:
	docker-compose exec postgresql-geo-api psql -U "${GEO_POSTGRES_USER}"

# Stop all containers and remove the postgresql-api container and the named
# Docker volume used to persists PostgreSQL data
#
# The use of `-f` flags in the `docker-compose rm` and `docker volume rm`
# commands is to ignore errors if the container or volume being deleted
# don't actually exist.
#
# @debt We should ideally avoid hardcoding container and volume name so that
# any changes here or in `docker-compose.yml` will not get things out of sync.
# Or add a CI test that could catch this.
clean-slate: stop
	docker-compose rm -f postgresql-api
	docker-compose rm -f postgresql-geo-api
	docker volume rm -f marxan-cloud_marxan-cloud-postgresql-api-data
	docker volume rm -f marxan-cloud_marxan-cloud-postgresql-geo-data

seed-dbs: seed-api-with-test-data | seed-geodb-data-full

seed-api-with-test-data:
	docker-compose exec -T postgresql-api psql -U "${API_POSTGRES_USER}" < api/test/fixtures/test-data.sql

<<<<<<< HEAD
seed-geodb-data:
<<<<<<< HEAD
	docker-compose exec -T postgresql-api psql -U "${API_POSTGRES_USER}" < api/test/fixtures/test-data.sql

test-e2e-api:
	docker-compose -f docker-compose-test-e2e.yml --env-file .env-test-e2e rm --stop --force test-e2e-postgresql-api test-e2e-postgresql-geo-api
	docker-compose -f docker-compose-test-e2e.yml --env-file .env-test-e2e up --build --abort-on-container-exit --exit-code-from api api
	docker-compose -f docker-compose-test-e2e.yml --env-file .env-test-e2e rm --stop --force
=======
=======
seed-geodb-data-full:
>>>>>>> added pipe for terrestrial ecosystems
	docker-compose -f ./data/docker-compose-data_download.yml up --build
<<<<<<< HEAD
	# docker-compose exec -T postgresql-api psql -U "${API_POSTGRES_USER}" < api/test/fixtures/test-data.sql
>>>>>>> added results and exetend to a metadata column  in the scenario feature data table that controls usage of features in a scenario
=======
>>>>>>> allow parallel execution of gadm make, and update recipe for node buffer and seed
