SHELL=/bin/bash
.PHONY: import
MAKEFLAGS := --jobs=$(shell nproc)
MAKEFLAGS += --output-sync=target

URL := $(shell curl -sS 'https://www.protectedplanet.net/downloads' \
		-H 'content-type: application/json;charset=UTF-8' \
		--data-raw '{"domain":"general","format":"shp","token":"wdpa","id":51216}' \
		--compressed | jq '.url')
SIMP_FOLDER := data/wdpa/simp
GEO_FOLDER := data/wdpa/geojson

# @debt
# need to add as the main admin user through auth and calling for it.
MarxanUser:=$(shell psql -X -A -t "postgresql://$$API_POSTGRES_USER:$$API_POSTGRES_PASSWORD@$$API_POSTGRES_HOST:$$API_POSTGRES_PORT/$$API_POSTGRES_DB" -c "select id from users limit 1")

import: simp
	for i in $(SIMP_FOLDER)/*.json; do \
		ogr2ogr -makevalid -update -append \
		-nln wdpa -nlt PROMOTE_TO_MULTI \
		-geomfield the_geom \
		-t_srs EPSG:4326 -a_srs EPSG:4326 \
		-f PostgreSQL PG:"dbname=$$GEO_POSTGRES_DB host=$$GEO_POSTGRES_HOST \
		port=$$GEO_POSTGRES_PORT user=$$GEO_POSTGRES_USER password=$$GEO_POSTGRES_PASSWORD schemas=myshapefiles" "$$i" \
		-sql "select *,'$(MarxanUser)' as created_by from \"$$(basename -s .json "$$i")\""; \
	done;
	rm -rf $(SIMP_FOLDER)

merge-original:
	mapshaper-xl 16gb -i data/wdpa/data/*.shp snap combine-files \
	-merge-layers force name=test target=* \
	-o data/wdpa/merge.geojson precision=0.00001 target=test format=geojson force ndjson;

merge-simplify:
	mapshaper-xl 16gb -i $(SIMP_FOLDER)/*.json snap combine-files \
	-merge-layers force name=test target=* \
	-o data/wdpa/merge-simp.shp target=test format=shapefile force

# @debt
# need to review island removal
simp: geo
	mkdir -p $(SIMP_FOLDER)
	mapshaper-xl 16gb -i $(GEO_FOLDER)/*.json snap \
				-simplify 20% planar keep-shapes \
				-filter-islands min-vertices=3 min-area=10000m2 remove-empty \
				-filter-slivers min-area=10000m2 remove-empty \
				-clean rewind \
				-o $(SIMP_FOLDER)/ format=geojson force ndjson;
	rm -rf $(GEO_FOLDER)

# @debt
# need to review a better way to split the files than using the iucn category
geo: data/wdpa/data
	mkdir -p $(GEO_FOLDER)
	mapshaper-xl 16gb -i $</*.shp no-topology combine-files \
		-merge-layers \
    	-each "group = Math.trunc(this.id/20000)+1" \
    	-split group \
		-o $(GEO_FOLDER)/ format=geojson \
		precision=0.0001 force ndjson;

data/wdpa/data: data/wdpa/wdpa.zip
	@unzip -u $< -d data/wdpa/out
	@for f in data/wdpa/out/*.zip; \
		do echo "$$(basename $$f)"; \
		mkdir -p $@/temp; \
		unzip "$$f" -d $@/temp; \
		mv $@/temp/*-polygons.shp $@/$$(basename $$f .zip).shp; \
   		mv $@/temp/*-polygons.shx $@/$$(basename $$f .zip).shx; \
		mv $@/temp/*-polygons.dbf $@/$$(basename $$f .zip).dbf; \
      	mv $@/temp/*-polygons.prj $@/$$(basename $$f .zip).prj; \
        mv $@/temp/*-polygons.cpg $@/$$(basename $$f .zip).cpg; \
		rm -rf $@/temp; \
	done

data/wdpa/wdpa.zip: | data/wdpa
	cd data/wdpa && curl -o $(shell basename $@) $(URL)

data/wdpa:
	mkdir -p $@

clean:
	rm -rf data/wdpa/
