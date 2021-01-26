.PHONY: import



import: data/gadm36_0_simp.shp data/gadm36_1_simp.shp data/gadm36_2_simp.shp
	ogr2ogr -overwrite -nln gadm_admin0 -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=geom -f PostgreSQL PG:"dbname='mgis-api' host='mgis-postgres' port=5432 user='mgis-api' password=$$POSTGRES_PASSWORD" data/gadm36_0_simp.shp
	ogr2ogr -overwrite -nln gadm_admin1 -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=geom -f PostgreSQL PG:"dbname='mgis-api' host='mgis-postgres' port=5432 user='mgis-api' password=$$POSTGRES_PASSWORD" data/gadm36_1_simp.shp
	ogr2ogr -overwrite -nln gadm_admin2 -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=geom -f PostgreSQL PG:"dbname='mgis-api' host='mgis-postgres' port=5432 user='mgis-api' password=$$POSTGRES_PASSWORD" data/gadm36_2_simp.shp

data/gadm36_%_simp.shp: data/gadm36_%.shp
	mapshaper $< -simplify 10% -filter-islands min-vertices=3 -filter-slivers -clean -o $@ force

data/gadm36_0.shp data/gadm36_1.shp data/gadm36_2.shp: data/gadm36_levels_shp.zip
	unzip -u $< -d data

data/gadm36_levels_shp.zip: | data
	cd data && curl -O https://data.biogeo.ucdavis.edu/data/gadm3.6/gadm36_levels_shp.zip

data:
	mkdir -p $@

clean:
	rm -rf data/
