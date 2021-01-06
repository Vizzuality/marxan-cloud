ifneq (,$(wildcard ./.env))
    include .env
    export
endif

.PHONY: start

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
	docker volume rm -f marxan-cloud_marxan-cloud-postgresql-api-data

seed-api-with-sample-data:
	docker-compose exec -T postgresql-api psql -U "${API_POSTGRES_USER}" < api/test/fixtures/test-data.sql
