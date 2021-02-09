.PHONY: import

# @debt
	# iucn downloads came from https://spatial-data-2020onwards.s3-eu-west-1.amazonaws.com/
	# in the future it should came from the api and be ingested throught the features pipe.

import: data/iucn/MAMMALS_simp.shp
	# import data in the geodb for further use
	ogr2ogr -makevalid -overwrite \
		-nln mamals_feature -nlt PROMOTE_TO_MULTI \
		-lco GEOMETRY_NAME=the_geom \
		-f PostgreSQL PG:"dbname=$$GEO_POSTGRES_DB host='marxan-postgresql-geo-api' \
		port=5432 user=$$GEO_POSTGRES_USER password=$$GEO_POSTGRES_PASSWORD" $<
	# Creates a new feature dataset in the api db
	psql "postgresql://$$API_POSTGRES_USER:$$API_POSTGRES_PASSWORD@marxan-postgresql-api:5432/$$API_POSTGRES_DB" \
	-c "insert into features(item_id, item_group, name) \
		(SELECT * FROM mamals_feature);"
	# Ingest the features in the dataset feature geodb features_data table
	psql "postgresql://$$GEO_POSTGRES_USER:$$GEO_POSTGRES_PASSWORD@marxan-postgresql-geo-api:5432/$$GEO_POSTGRES_DB" \
	-c "insert into features_data(item_id, item_group, name) \
		(SELECT * FROM mamals_feature);"

data/iucn/MAMMALS_simp.shp: data/iucn/MAMMALS.shp
	mapshaper-xl 16gb -i $< \
		-filter-islands min-vertices=3 \
		-filter-slivers \
		-clean rewind \
		-o $@ precision=0.00001 force

data/iucn/MAMMALS.shp: data/iucn/MAMMALS.zip
	unzip -u $< -d data/iucn

data/iucn/MAMMALS.zip: | data/iucn
	cd data/iucn && curl -O https://spatial-data-2020onwards.s3-eu-west-1.amazonaws.com/groups/MAMMALS.zip

data/iucn:
	mkdir -p $@

clean:
	rm -rf data/
