.DEFAULT_GOAL := restore

restore: restore-api | restore-geodb

restore-api: api_db-2021-03-01.tar.gz
	@echo "Restoring api dbs dumps..."
	mkdir ./$$(basename $< .tar.gz)/
	tar -xvf ./db_dumps/$< -C ./$$(basename $< .tar.gz)/ && pg_restore -d "postgresql://$$API_POSTGRES_USER:$$API_POSTGRES_PASSWORD@marxan-postgresql-api:5432/$$API_POSTGRES_DB"  -Fd -c ./$$(basename $< .tar.gz)
	rm -rf $$(basename $< .tar.gz)/
restore-geodb: geo_db-2021-03-01.tar.gz
	@echo "Restoring geo dbs dumps..."
	@ls db_dumps
	mkdir ./$$(basename $< .tar.gz)/
	tar -xvf ./db_dumps/$< -C ./$$(basename $< .tar.gz)/ && pg_restore -d "postgresql://$$GEO_POSTGRES_USER:$$GEO_POSTGRES_PASSWORD@marxan-postgresql-geo-api:5432/$$GEO_POSTGRES_DB" -Fd -c ./$$(basename $< .tar.gz)
	rm -rf $$(basename $< .tar.gz)/

api_db-2021-03-01.tar.gz:
	cd ./db_dumps/ && curl -O https://marxancloudtest.blob.core.windows.net/data-ingestion-test-00/dbs-dumps/api_db-2021-03-01.tar.gz

geo_db-2021-03-01.tar.gz:
	@ls db_dumps
	cd ./db_dumps/ && curl -O https://marxancloudtest.blob.core.windows.net/data-ingestion-test-00/dbs-dumps/geo_db-2021-03-01.tar.gz
