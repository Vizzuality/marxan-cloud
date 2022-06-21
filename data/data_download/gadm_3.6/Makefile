.PHONY: import
# MAKEFLAGS := --jobs=$(shell nproc)
# MAKEFLAGS += --output-sync=target

import: data/gadm/gadm36_simp.geojson
	ogr2ogr -makevalid \
		-update -append \
		-geomfield the_geom \
		--config OGR_TRUNCATE YES \
		-nln admin_regions -nlt PROMOTE_TO_MULTI \
		-t_srs EPSG:4326 -a_srs EPSG:4326 \
		-f PostgreSQL PG:"dbname=$$GEO_POSTGRES_DB host=$$GEO_POSTGRES_HOST \
		port=$$GEO_POSTGRES_PORT user=$$GEO_POSTGRES_USER password=$$GEO_POSTGRES_PASSWORD" $< \
		-sql "select *,'00000000-0000-0000-0000-000000000000' as created_by from \"$$(basename -s .geojson "$<")\"";

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
