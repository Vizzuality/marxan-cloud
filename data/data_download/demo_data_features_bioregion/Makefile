.PHONY: import

MarxanUser:=$(shell psql -X -A -t "postgresql://$$API_POSTGRES_USER:$$API_POSTGRES_PASSWORD@$$API_POSTGRES_HOST:$$API_POSTGRES_PORT/$$API_POSTGRES_DB" -c "select id from users limit 1")

import: data/demo_data_features/features_demos
	@for i in $</*.shp; do \
		echo "start processing $$i "; \
		table_name=`basename -s .shp "$$i" | tr -d ' \t\n\r' | tr [:upper:] [:lower:]`; \
		spec_name=`basename -s .shp "$$i"`; \
		echo "creating temporal table $${table_name}_feature..."; \
		ogr2ogr -t_srs EPSG:4326 -makevalid \
			-nln "$${table_name}_feature" -nlt PROMOTE_TO_MULTI \
			-lco GEOMETRY_NAME=the_geom -lco OVERWRITE=yes \
			-f PostgreSQL PG:"dbname=$$GEO_POSTGRES_DB host=$$GEO_POSTGRES_HOST \
			port=$$GEO_POSTGRES_PORT user=$$GEO_POSTGRES_USER password=$$GEO_POSTGRES_PASSWORD" "$$i" ;\
		echo "getting the list of properties"; \
		list_properties=`psql -t "postgresql://$$GEO_POSTGRES_USER:$$GEO_POSTGRES_PASSWORD@$$GEO_POSTGRES_HOST:$$GEO_POSTGRES_PORT/$$GEO_POSTGRES_DB" \
		-c "select array_to_json(array_agg(keys)) as list_property_keys from (select distinct jsonb_object_keys(row_to_json(t.*)::jsonb - '{the_geom}'::text[]) as keys from \"$${table_name}_feature\" as t) d;"`; \
		default_property=`psql -t "postgresql://$$GEO_POSTGRES_USER:$$GEO_POSTGRES_PASSWORD@$$GEO_POSTGRES_HOST:$$GEO_POSTGRES_PORT/$$GEO_POSTGRES_DB" \
		-c "select jsonb_object_keys(row_to_json(t.*)::jsonb - '{the_geom}'::text[]) as keys from \"$${table_name}_feature\" as t limit 1;"`; \
		echo "$$list_properties"; \
		echo "getting the feature_id..."; \
		feature_id=`psql -X -A -q -t "postgresql://$$API_POSTGRES_USER:$$API_POSTGRES_PASSWORD@$$API_POSTGRES_HOST:$$API_POSTGRES_PORT/$$API_POSTGRES_DB" \
 			-c "insert into features (feature_class_name, alias, list_property_keys, property_name, tag, creation_status, created_by)  \
 			VALUES ('demo_$${table_name}', '$${spec_name}','$$list_properties'::jsonb, '$$default_property', 'bioregional','created','$(MarxanUser)') RETURNING id;"`; \
		echo "inserting in feature data..."; \
		psql "postgresql://$$GEO_POSTGRES_USER:$$GEO_POSTGRES_PASSWORD@$$GEO_POSTGRES_HOST:$$GEO_POSTGRES_PORT/$$GEO_POSTGRES_DB" \
		-c "insert into features_data(the_geom, properties, source, feature_id) \
			(SELECT the_geom, row_to_json(t)::jsonb - '{the_geom}'::text[] as properties, 'iucn' as source, '$$feature_id' as feature_id from (select * from \"$${table_name}_feature\") t); \
			 DROP TABLE \"$${table_name}_feature\""; \
	done

data/demo_data_features/features_demos: data/demo_data_features/bioregions.zip
	@unzip -o -u $< -d $@

data/demo_data_features/bioregions.zip: data/demo_data_features
	@cd $< && curl -O https://marxancloudtest.blob.core.windows.net/data-ingestion-test-00/data-demo/bioregion/bioregions.zip

data/demo_data_features:
	@mkdir -p $@

clean:
	rm -rf data/
