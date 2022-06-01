.PHONY: import
# MAKEFLAGS := --jobs=$(shell nproc)
# MAKEFLAGS += --output-sync=target

MarxanUser:=$(shell psql -X -A -t "postgresql://$$API_POSTGRES_USER:$$API_POSTGRES_PASSWORD@$$API_POSTGRES_HOST:$$API_POSTGRES_PORT/$$API_POSTGRES_DB" -c "select id from users limit 1")
import: data/eez/eez_v11_simp.geojson
	ogr2ogr -makevalid \
		-update -append \
		-geomfield the_geom \
		--config OGR_TRUNCATE NO \
		-nln admin_regions -nlt PROMOTE_TO_MULTI \
		-t_srs EPSG:4326 -a_srs EPSG:4326 \
		-f PostgreSQL PG:"dbname=$$GEO_POSTGRES_DB host=$$GEO_POSTGRES_HOST \
		port=$$GEO_POSTGRES_PORT user=$$GEO_POSTGRES_USER password=$$GEO_POSTGRES_PASSWORD" $< \
		-sql "select *,'$(MarxanUser)' as created_by from \"$$(basename -s .geojson "$<")\"";

data/eez/eez_v11_simp.geojson: data/eez/eez_v11.shp
	mapshaper-xl -i $< snap \
				-simplify 25% planar keep-shapes \
				-filter-islands min-vertices=3 min-area=10000m2 remove-empty \
				-filter-slivers min-area=10000m2 remove-empty \
				-clean rewind \
				-each 'level= "eez"' \
				-rename-fields GEONAME=NAME_0,ISO_SOV1=ISO3 \
				-drop fields=MRGID,MRGID_TER1,MRGID_SOV1,TERRITORY1,\
					ISO_TER1,SOVEREIGN1,MRGID_TER2,MRGID_SOV2,TERRITORY2,ISO_TER2,SOVEREIGN2,\
					MRGID_TER3,MRGID_SOV3,TERRITORY3,ISO_TER3,SOVEREIGN3,X_1,Y_1,AREA_KM2,ISO_SOV2,\
					ISO_SOV3,UN_SOV1,UN_SOV2,UN_SOV3,UN_TER1,UN_TER2,UN_TER3 \
				-o $@ format=geojson force ndjson

data/eez/eez_v11.shp: data/eez/World_EEZ_v11_20191118.zip
	unzip -u $< -d data/eez

data/eez/World_EEZ_v11_20191118.zip: | data/eez
	cd data/gadm && \
	curl --location --request POST 'https://www.marineregions.org/download_file.php?name=World_EEZ_v11_20191118.zip' \
					--header 'Cookie: PHPSESSID=870e305efbc0519d59b361427dbd8336; vliz_webc=vliz_webc1' \
					--form 'name="Jen"' \
					--form 'organisation="TNC"' \
					--form 'email="admin@marxan.com"' \
					--form 'country="EEUU"' \
					--form 'user_category="academia"' \
					--form 'purpose_category="Conservation"' \
					--form 'agree="1"' \

data/eez:
	mkdir -p $@

clean:
	rm -rf data/eez/
