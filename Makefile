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
	docker exec -it marxan-postgresql-api psql -U "${API_POSTGRES_USER}"

# Stop all containers and remove the postgresql-api container and the named
# Docker volume used to persists PostgreSQL data
#
# @debt We should ideally avoid hardcoding container and volume name so that
# any changes here or in `docker-compose.yml` will not get things out of sync.
# Or add a CI test that could catch this.
clean-slate: stop
	docker-compose rm postgresql-api
	docker volume rm marxan-cloud_marxan-cloud-postgresql-api-data
