apk add coreutils sed bash
cd /opt
export PGPASSWORD=$GEO_POSTGRES_PASSWORD
# load test data - API
psql -U $API_POSTGRES_USER < ./test-data.sql
# load test data - geoprocessing db
sed -e "s/\$user/00000000-0000-0000-0000-000000000000/g" ./test-admin-data.sql | psql -h postgresql-geo-api -U $GEO_POSTGRES_USER
sed -e "s/\$user/00000000-0000-0000-0000-000000000000/g" ./test-wdpa-data.sql | psql -h postgresql-geo-api -U $GEO_POSTGRES_USER
psql -U $API_POSTGRES_USER < ./test-features.sql
for i in ./features/*.sql
do
	table_name=`basename -s .sql $i`;
	featureid=`psql -X -A -t -U $API_POSTGRES_USER -c "select id from features where feature_class_name = '$table_name'"`
	echo "appending data for ${table_name} with id ${featureid}";
	sed -e "s/\$feature_id/${featureid}/g" ./features/${table_name}.sql | psql -h postgresql-geo-api -U $GEO_POSTGRES_USER
done

psql -X -A -t -U $API_POSTGRES_USER -c "select id from scenarios where name = 'Example scenario 1 Project 1 Org 1'"

SCENARIOID=$(psql -X -A -t -U $API_POSTGRES_USER -c "select id from scenarios where name = 'Example scenario 1 Project 1 Org 1'")
echo "appending data for scenario with id ${SCENARIOID}"
sed -e "s/\$user/00000000-0000-0000-0000-000000000000/g" -e "s/\$scenario/${SCENARIOID}/g" ./test-geodata.sql | psql -h postgresql-geo-api -U $GEO_POSTGRES_USER
	