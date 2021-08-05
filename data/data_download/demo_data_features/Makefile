.PHONY: import

MarxanUser:=$(shell psql -X -A -t "postgresql://$$API_POSTGRES_USER:$$API_POSTGRES_PASSWORD@marxan-postgresql-api:5432/$$API_POSTGRES_DB" -c "select id from users limit 1")

import: data/demo_data_features/features-demos
	@echo ls $<
	@ls $<
	@for i in $</*.shp; do \
		echo "creating table $$i"; \
		mapshaper "$$i" -info; \
		# table_name=`basename -s .shp "$$i" | tr -d ' \t\n\r' | tr [:upper:] [:lower:]`; \
		# spec_name=`basename -s .shp "$$i"`; \
		# echo "creating table $${table_name}_feature"; \
		# ogr2ogr -makevalid \
		# 	-nln "$${table_name}_feature" -nlt PROMOTE_TO_MULTI \
		# 	-lco GEOMETRY_NAME=the_geom -lco OVERWRITE=yes \
		# 	-f PostgreSQL PG:"dbname=$$GEO_POSTGRES_DB host='marxan-postgresql-geo-api' \
		# 	port=5432 user=$$GEO_POSTGRES_USER password=$$GEO_POSTGRES_PASSWORD" "$$i" ;\
		# feature_id=`psql -X -A -q -t "postgresql://$$API_POSTGRES_USER:$$API_POSTGRES_PASSWORD@marxan-postgresql-api:5432/$$API_POSTGRES_DB" \
 		# 	-c "insert into features (feature_class_name, alias, list_property_keys, property_name, tag, creation_status, created_by)  \
 		# 	VALUES ('iucn_$${table_name}', '$${spec_name}','[\"id_no\",\"binomial\",\"presence\",\"origin\",\"seasonal\",\"compiler\",\"yrcompiled\",\"citation\",\"subspecies\",\"subpop\",\"source\",\"island\",\"tax_comm\",\"dist_comm\",\"generalisd\",\"legend\",\"kingdom\",\"phylum\",\"class\",\"order_\",\"family\",\"genus\",\"category\",\"marine\",\"terrestial\",\"freshwater\",\"SHAPE_Leng\",\"SHAPE_Area\"]'::jsonb, 'binomial', 'species','created','$(MarxanUser)') RETURNING id;"`; \
		# psql "postgresql://$$GEO_POSTGRES_USER:$$GEO_POSTGRES_PASSWORD@marxan-postgresql-geo-api:5432/$$GEO_POSTGRES_DB" \
		# -c "insert into features_data(the_geom, properties, source, feature_id) \
		# 	(SELECT the_geom, row_to_json(t)::jsonb - '{the_geom}'::text[] as properties, 'iucn' as source, '$$feature_id' as feature_id from (select * from \"$$(basename -s .json "$$i" | tr -d ' \t\n\r' | tr [:upper:] [:lower:])_feature\") t); \
		# 	 DROP TABLE \"$${table_name}_feature\""; \
	done

data/demo_data_features/features-demos: data/demo_data_features/features-demos.zip
	@unzip -o -u $< -d $@

data/demo_data_features/features-demos.zip: data/demo_data_features
	@cd $< && curl -O https://marxancloudtest.blob.core.windows.net/data-ingestion-test-00/data-demo/features_demos.zip

data/demo_data_features:
	@mkdir -p $@

clean:
	rm -rf data/
