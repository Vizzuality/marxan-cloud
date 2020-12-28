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
