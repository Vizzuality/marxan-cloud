version: "3.8"
services:
  api:
    image: ${API_IMAGE_TAG}

  geoprocessing:
    image: ${GEOPROCESSING_IMAGE_TAG}

  test-e2e-postgresql-api:
    image: ${APIDB_IMAGE_TAG}

  test-e2e-postgresql-geo-api:
    image: ${GEODB_IMAGE_TAG}

  test-e2e-redis:
    image: ${REDIS_IMAGE_TAG}
