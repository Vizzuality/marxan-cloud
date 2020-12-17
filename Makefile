ifneq (,$(wildcard ./.env))
    include .env
    export
endif

.PHONY: start

start:
	docker-compose up --build

stop:
	docker-compose stop

psql:
	docker exec -it marxan-postgresql-api psql -U "${API_POSTGRES_USER}"
