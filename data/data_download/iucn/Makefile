.PHONY: import

# @debt
# iucn downloads came from https://spatial-data-2020onwards.s3-eu-west-1.amazonaws.com/
# in the future it should came from the api and be ingested throught the features pipe.

MarxanUser:=$(shell psql -X -A -t "postgresql://$$API_POSTGRES_USER:$$API_POSTGRES_PASSWORD@marxan-postgresql-api:5432/$$API_POSTGRES_DB" -c "select id from users limit 1")

import: data/iucn/simp/%
	@echo data/iucn/simp/%
	@for i in data/iucn/simp/*.json; do \
		table_name=`basename -s .json "$$i" | tr -d ' \t\n\r' | tr [:upper:] [:lower:]`; \
<<<<<<< HEAD
=======
		spec_name=`basename -s .json "$$i"`; \
>>>>>>> fbf3f123f8cc06fb4b1eda6e3680ba304ca80149
		echo "creating table $${table_name}_feature"; \
		ogr2ogr -makevalid \
			-nln "$${table_name}_feature" -nlt PROMOTE_TO_MULTI \
			-lco GEOMETRY_NAME=the_geom -lco OVERWRITE=yes \
			-f PostgreSQL PG:"dbname=$$GEO_POSTGRES_DB host='marxan-postgresql-geo-api' \
			port=5432 user=$$GEO_POSTGRES_USER password=$$GEO_POSTGRES_PASSWORD" "$$i" ;\
		feature_id=`psql -X -A -q -t "postgresql://$$API_POSTGRES_USER:$$API_POSTGRES_PASSWORD@marxan-postgresql-api:5432/$$API_POSTGRES_DB" \
<<<<<<< HEAD
 			-c "insert into features (feature_class_name, property_name, tag, creation_status, created_by)  \
 			VALUES ('iucn_$${table_name}', 'binomial', 'species','created','$(MarxanUser)') RETURNING id;"`; \
		psql "postgresql://$$GEO_POSTGRES_USER:$$GEO_POSTGRES_PASSWORD@marxan-postgresql-geo-api:5432/$$GEO_POSTGRES_DB" \
		-c "insert into features_data(the_geom, properties, source, features_id) \
			(SELECT the_geom, row_to_json(t)::jsonb - '{the_geom}'::text[] as properties, 'iucn' as source, '$$feature_id' as features_id from (select * from \"$$(basename -s .json "$$i" | tr -d ' \t\n\r' | tr [:upper:] [:lower:])_feature\") t); \
=======
 			-c "insert into features (feature_class_name, alias, list_property_keys, property_name, tag, creation_status, created_by)  \
 			VALUES ('iucn_$${table_name}', '$${spec_name}','[\"id_no\",\"binomial\",\"presence\",\"origin\",\"seasonal\",\"compiler\",\"yrcompiled\",\"citation\",\"subspecies\",\"subpop\",\"source\",\"island\",\"tax_comm\",\"dist_comm\",\"generalisd\",\"legend\",\"kingdom\",\"phylum\",\"class\",\"order_\",\"family\",\"genus\",\"category\",\"marine\",\"terrestial\",\"freshwater\",\"SHAPE_Leng\",\"SHAPE_Area\"]'::jsonb, 'binomial', 'species','created','$(MarxanUser)') RETURNING id;"`; \
		psql "postgresql://$$GEO_POSTGRES_USER:$$GEO_POSTGRES_PASSWORD@marxan-postgresql-geo-api:5432/$$GEO_POSTGRES_DB" \
		-c "insert into features_data(the_geom, properties, source, feature_id) \
			(SELECT the_geom, row_to_json(t)::jsonb - '{the_geom}'::text[] as properties, 'iucn' as source, '$$feature_id' as feature_id from (select * from \"$$(basename -s .json "$$i" | tr -d ' \t\n\r' | tr [:upper:] [:lower:])_feature\") t); \
>>>>>>> fbf3f123f8cc06fb4b1eda6e3680ba304ca80149
			 DROP TABLE \"$${table_name}_feature\""; \
	done
data/iucn/simp/%: data/iucn/out/%
	@mapshaper-xl 16gb -i $(shell dirname $<)/*.json \
<<<<<<< HEAD
		-simplify 10% planar keep-shapes \
		-filter-islands min-vertices=3 \
		-filter-slivers \
=======
		-simplify 25% planar keep-shapes \
		-filter-islands min-vertices=3 min-area=10000m2 remove-empty \
		-filter-slivers min-area=10000m2 remove-empty \
>>>>>>> fbf3f123f8cc06fb4b1eda6e3680ba304ca80149
		-clean rewind \
		-o $(shell dirname $@)/ format=geojson precision=0.000001

# @debt
# instead of only one file we should split files in species and ingest them separetly so features represent species from iucn
data/iucn/out/%: data/iucn/MAMMALS.shp
	@mapshaper-xl 16gb -i $< \
		-split 'binomial' \
		-o $(shell dirname $@)/ format=geojson precision=0.000001

data/iucn/MAMMALS.shp: data/iucn/MAMMALS.zip
<<<<<<< HEAD
	@unzip -u $< -d data/iucn
=======
	@unzip -o -u $< -d data/iucn
>>>>>>> fbf3f123f8cc06fb4b1eda6e3680ba304ca80149

data/iucn/MAMMALS.zip: data/iucn simp out
	@cd $< && curl -O https://spatial-data-2020onwards.s3-eu-west-1.amazonaws.com/groups/MAMMALS.zip

data/iucn:
	@mkdir -p $@

simp:
	@mkdir -p data/iucn/$@

out:
	mkdir -p data/iucn/$@

clean:
	rm -rf data/
