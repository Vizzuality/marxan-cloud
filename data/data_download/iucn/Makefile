.PHONY: import

#MAKEFLAGS := --jobs=$(shell nproc)
#MAKEFLAGS += --output-sync=target
# @debt
# iucn downloads came from https://spatial-data-2020onwards.s3-eu-west-1.amazonaws.com/
# in the future it should came from the api and be ingested throught the features pipe.
# ogr2ogr -makevalid -update -append \
# 			-nln ${$$i}_feature -nlt PROMOTE_TO_MULTI \
# 			-lco GEOMETRY_NAME=the_geom \
# 			-f PostgreSQL PG:"dbname=$$GEO_POSTGRES_DB host='marxan-postgresql-geo-api' \
# 			port=5432 user=$$GEO_POSTGRES_USER password=$$GEO_POSTGRES_PASSWORD" $< ;\
# 		# Ingest the features in the dataset feature geodb features_data table \
# 		psql "postgresql://$$GEO_POSTGRES_USER:$$GEO_POSTGRES_PASSWORD@marxan-postgresql-geo-api:5432/$$GEO_POSTGRES_DB" \
# 		-c "insert into features_data(item_id, item_group, name) \
# 			(SELECT the_geom ,to_jsonb() as property, 'uicn' as source, $$Results as features_id FROM mamals_feature); DROP TABLE mamals_feature"; \

MarxanUser:=$(shell psql -X -A -t "postgresql://$$API_POSTGRES_USER:$$API_POSTGRES_PASSWORD@marxan-postgresql-api:5432/$$API_POSTGRES_DB" -c "select id from users limit 1")

import:
	for i in data/iucn/simp/*.json; do \
		t = psql -X -A -q -t "postgresql://$$API_POSTGRES_USER:$$API_POSTGRES_PASSWORD@marxan-postgresql-api:5432/$$API_POSTGRES_DB" \
			-c "insert into features (feature_class_name, property_name, tag, creation_status, created_by)  \
			VALUES ('iucn_$$(basename -s .json $$i)', 'binomial', 'species','created','$(MarxanUser)') RETURNING id;"); \
		break;\
	done
data/iucn/simp/%: data/iucn/out/%
	mapshaper-xl 16gb -i $(shell dirname $<)/*.json \
		-simplify 10% planar keep-shapes \
		-filter-islands min-vertices=3 \
		-filter-slivers \
		-clean rewind \
		-o $(shell dirname $@)/ format=geojson precision=0.000001

# @debt
# instead of only one file we should split files in species and ingest them separetly so features represent species from iucn
data/iucn/out/%: data/iucn/MAMMALS.shp
	mapshaper-xl 16gb -i $< \
		-split 'binomial' \
		-o $(shell dirname $@)/ format=geojson precision=0.000001

data/iucn/MAMMALS.shp: data/iucn/MAMMALS.zip
	unzip -u $< -d data/iucn

data/iucn/MAMMALS.zip: data/iucn simp out
	cd $< && curl -O https://spatial-data-2020onwards.s3-eu-west-1.amazonaws.com/groups/MAMMALS.zip

data/iucn:
	mkdir -p $@

simp:
	mkdir -p data/iucn/$@

out:
	mkdir -p data/iucn/$@

clean:
	rm -rf data/
