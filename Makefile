ifneq (,$(wildcard ./.env))
    include .env
    export
endif

.PHONY: start

# Start only API and Geoprocessing services
#
# Useful when developing on API components only, to avoid spinning services
# which may not be needed.
start-api:
	docker-compose up --build api geoprocessing postgresql-api postgresql-geo-api redis-api

start:
	docker-compose up --build

notebooks:
	docker-compose -f ./data/docker-compose.yml up --build

stop:
	docker-compose stop

psql:
	docker-compose exec postgresql-api psql -U "${API_POSTGRES_USER}"

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

seed-api-with-test-data:
	docker-compose exec -T postgresql-api psql -U "${API_POSTGRES_USER}" < api/test/fixtures/test-data.sql
seed-geodb-data:
	docker-compose exec -T postgresql-api psql -U "${API_POSTGRES_USER}" < api/test/fixtures/test-data.sql
