.PHONY: import

URL := $(shell curl -i 'https://esri.maps.arcgis.com/sharing/rest/content/items/12230625b4d8409982f1361a1c03270f/data' | grep "location" | head -1 | cut -d ":" -f 2-20 | tr -d ' \t\n\r')
MarxanUser:=$(shell psql -X -A -t "postgresql://$$API_POSTGRES_USER:$$API_POSTGRES_PASSWORD@marxan-postgresql-api:5432/$$API_POSTGRES_DB" -c "select id from users limit 1")

# @debt
# instead of dn being numeric, it will be more usefull in terms of info to join that with the metadata description of those values
import: data/ecosystems/World_Ecosystems_simp.geojson
	table_name=`basename -s .geojson "$<" | tr -d ' \t\n\r' | tr [:upper:] [:lower:]`; \
	echo "creating temporary table $${table_name}_features"; \
	ogr2ogr -makevalid \
		-nln "$${table_name}_feature" -nlt PROMOTE_TO_MULTI \
		-lco GEOMETRY_NAME=the_geom -lco OVERWRITE=yes \
		-f PostgreSQL PG:"dbname=$$GEO_POSTGRES_DB host='marxan-postgresql-geo-api' \
		port=5432 user=$$GEO_POSTGRES_USER password=$$GEO_POSTGRES_PASSWORD" "$<";\
	feature_id=`psql -X -A -q -t "postgresql://$$API_POSTGRES_USER:$$API_POSTGRES_PASSWORD@marxan-postgresql-api:5432/$$API_POSTGRES_DB" \
		-c "insert into features (feature_class_name, alias, list_property_keys, property_name, tag, creation_status, created_by)  \
		VALUES ('$${table_name}', 'World terrestrial ecoregions','[\"dn\", \"w_ecosystm\"]'::jsonb,'w_ecosystm', 'bioregional','created','$(MarxanUser)') RETURNING id;"`; \
	psql "postgresql://$$GEO_POSTGRES_USER:$$GEO_POSTGRES_PASSWORD@marxan-postgresql-geo-api:5432/$$GEO_POSTGRES_DB" \
	-c "insert into features_data(the_geom, properties, source, feature_id) \
		(SELECT (st_dump(the_geom)).geom as the_geom, row_to_json(t)::jsonb - '{the_geom}'::text[] as properties, 'ecoregions' as source, '$$feature_id' as feature_id from (select * from \"$${table_name}_feature\") t); \
			DROP TABLE \"$${table_name}_feature\"";



data/ecosystems/World_Ecosystems_simp.geojson: data/ecosystems/World_Ecosystems.geojson
	mapshaper $< -simplify 15% planar keep-shapes \
	-filter-islands min-vertices=3 remove-empty \
	-filter-slivers remove-empty \
	-clean \
	-join data/ecosystems/categories.csv keys=DN,Value field-types=Value:int fields=W_Ecosystm \
	-o $@ force ndjson

data/ecosystems/World_Ecosystems.geojson: data/ecosystems/World_Ecosystems.tif
	gdal_polygonize.py $< -f GeoJSONSeq $@

data/ecosystems/World_Ecosystems.tif: | data/ecosystems
	cd data/ecosystems && curl "$(URL)" -o World_Ecosystems.tif

data/ecosystems:
	mkdir -p $@
	cp ./categories.csv $@/categories.csv

clean:
	rm -rf data/
