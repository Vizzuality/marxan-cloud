.DEFAULT_GOAL := restore

restore: restore-api | restore-geodb

restore-api: api_db-2021-03-01.tar.gz
	@echo "Restoring dbs dumps..."
	mkdir $$(basename $< .tar.gz)
	tar -xvf ./db_dumps/$< ./$$(basename $< .tar.gz)/ && pg_restore -d "postgresql://$$API_POSTGRES_USER:$$API_POSTGRES_PASSWORD@marxan-postgresql-api:5432/$$API_POSTGRES_DB"  -Fd -c ./$$(basename $< .tar.gz)
	rm -rf $$(basename $< .tar.gz)
restore-geodb: geo_db-2021-03-01.tar.gz
	@echo "Restoring dbs dumps..."
	pg_restore -a -d "postgresql://$$GEO_POSTGRES_USER:$$GEO_POSTGRES_PASSWORD@marxan-postgresql-geo-api:5432/$$GEO_POSTGRES_DB" -Ft $<

api_db-2021-03-01.tar.gz:
	cd ./db_dumps/ && curl -O https://marxancloudtest.blob.core.windows.net/data-ingestion-test-00/dbs-dumps/api_db-2021-03-01.tar.gz

geo_db-2021-03-01.tar.gz:
	cd ./db_dumps/ && curl -O https://marxancloudtest.blob.core.windows.net/data-ingestion-test-00/dbs-dumps/geo_db-2021-03-01.tar.gz
