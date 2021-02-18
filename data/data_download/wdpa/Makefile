.PHONY: import
MAKEFLAGS := --jobs=$(shell nproc)
MAKEFLAGS += --output-sync=target

URL := $(shell curl -sS 'https://www.protectedplanet.net/downloads' \
		-H 'content-type: application/json;charset=UTF-8' \
		--data-raw '{"domain":"general","format":"shp","token":"wdpa","id":51216}' \
		--compressed | jq '.url')
# @debt
# need to add as the main admin user through auth and calling for it.
MarxanUser:=$(shell psql -X -A -t "postgresql://$$API_POSTGRES_USER:$$API_POSTGRES_PASSWORD@marxan-postgresql-api:5432/$$API_POSTGRES_DB" -c "select id from users limit 1")
LIST = 0 1 2
targets = $(addprefix exec, $(LIST))

import: $(targets)

$(targets): exec%: data/wdpa/simp/%
	for i in $</*.json; do \
		ogr2ogr -makevalid -update -append -nln wdpa -nlt PROMOTE_TO_MULTI -lco  \
		GEOMETRY_NAME=the_geom -f PostgreSQL PG:"dbname=$$GEO_POSTGRES_DB host='marxan-postgresql-geo-api' \
		port=5432 user=$$GEO_POSTGRES_USER password=$$GEO_POSTGRES_PASSWORD schemas=myshapefiles" "$$i" \
		-sql "select *,'$(MarxanUser)' as created_by from \"$$(basename -s .json "$$i")\""; \
	done;

merge-original: data/wdpa/WDPA_WDOECM_wdpa_shp0/ data/wdpa/WDPA_WDOECM_wdpa_shp1/ data/wdpa/WDPA_WDOECM_wdpa_shp2/
	mapshaper-xl 16gb -i data/wdpa/WDPA_WDOECM_wdpa_shp0/*-polygons.shp data/wdpa/WDPA_WDOECM_wdpa_shp1/*-polygons.shp data/wdpa/WDPA_WDOECM_wdpa_shp2/*-polygons.shp snap combine-files \
	-merge-layers force name=test target=* \
	-o data/wdpa/merge.geojson precision=0.00001 target=test format=geojson force

merge-simplify: data/wdpa/simp/0 data/wdpa/simp/1 data/wdpa/simp/2
	mapshaper-xl 16gb -i data/wdpa/simp/0/*.json data/wdpa/simp/1/*.json data/wdpa/simp/2/*.json snap combine-files \
	-merge-layers force name=test target=* \
	-o data/wdpa/merge-simp.shp target=test format=shapefile force

# @debt
# need to review island removal
data/wdpa/simp/%: data/wdpa/geojson/%/
	mkdir -p $@
	mapshaper-xl 16gb -i $<*.json snap \
				-simplify 10% planar keep-shapes \
				-filter-islands min-vertices=3 remove-empty \
				-filter-slivers \
				-clean rewind \
				-o $@ format=geojson force

# @debt
# need to review a better way to split the files than using the iucn category
data/wdpa/geojson/%/: data/wdpa/WDPA_WDOECM_wdpa_shp%/
	mkdir -p $@
	mapshaper-xl 16gb -i $<*-polygons.shp name='$(shell basename $<)' \
					-split IUCN_CAT \
					-o $@ format=geojson precision=0.0000001

data/wdpa/WDPA_WDOECM_wdpa_shp0/ data/wdpa/WDPA_WDOECM_wdpa_shp1/ data/wdpa/WDPA_WDOECM_wdpa_shp2/: data/wdpa/WDPA_WDOECM_wdpa_shp.zip
	unzip -u $< -d data/wdpa/out

	unzip data/wdpa/out/$(shell basename $@).zip \
			-d data/wdpa/"$(shell basename $@)"

data/wdpa/WDPA_WDOECM_wdpa_shp.zip: | data/wdpa
	cd data/wdpa && curl -O $(URL)

data/wdpa:
	mkdir -p $@

clean:
	rm -rf data/wdpa/
