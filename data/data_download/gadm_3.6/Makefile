.PHONY: import
# MAKEFLAGS := --jobs=$(shell nproc)
# MAKEFLAGS += --output-sync=target

MarxanUser:=$(shell psql -X -A -t "postgresql://$$API_POSTGRES_USER:$$API_POSTGRES_PASSWORD@marxan-postgresql-api:5432/$$API_POSTGRES_DB" -c "select id from users limit 1")
import: data/gadm/gadm36_simp.geojson
	ogr2ogr -makevalid \
		-update -append \
		-geomfield the_geom \
		--config OGR_TRUNCATE YES \
		-nln admin_regions -nlt PROMOTE_TO_MULTI \
		-t_srs EPSG:4326 -a_srs EPSG:4326 \
		-f PostgreSQL PG:"dbname=$$GEO_POSTGRES_DB host='marxan-postgresql-geo-api' \
		port=5432 user=$$GEO_POSTGRES_USER password=$$GEO_POSTGRES_PASSWORD" $< \
		-sql "select *,'$(MarxanUser)' as created_by from \"$$(basename -s .geojson "$<")\"";

data/gadm/gadm36_simp.geojson: data/gadm/gadm36_0.shp data/gadm/gadm36_1.shp data/gadm/gadm36_2.shp
	mapshaper-xl -i data/gadm/gadm36_0.shp data/gadm/gadm36_1.shp data/gadm/gadm36_2.shp snap combine-files \
				-simplify 25% planar keep-shapes \
				-filter-islands min-vertices=3 min-area=10000m2 remove-empty \
				-filter-slivers min-area=10000m2 remove-empty \
				-clean rewind \
				-each 'level= this.layer_name =="gadm36_0" ? "country" \
							: this.layer_name =="gadm36_1" ? "adm_1" \
							: this.layer_name =="gadm36_2" ? "adm_2" \
							: null' \
				-merge-layers force name=test target=* \
				-o $@ target=test format=geojson force ndjson

data/gadm/gadm36_0.shp data/gadm/gadm36_1.shp data/gadm/gadm36_2.shp: data/gadm/gadm36_levels_shp.zip
	unzip -u $< -d data/gadm

data/gadm/gadm36_levels_shp.zip: | data/gadm
	cd data/gadm && curl -O https://data.biogeo.ucdavis.edu/data/gadm3.6/gadm36_levels_shp.zip

data/gadm:
	mkdir -p $@

clean:
	rm -rf data/gadm/
