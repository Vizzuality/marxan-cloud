#!/bin/sh
set -e

case "$1" in
    develop)
        echo "Running Development Server"
        exec yarn start:dev
        ;;
    test-unit)
        echo "Running Unit Tests"
        exec yarn test:unit
        ;;
    test-e2e)
        echo "Running e2e Tests"
        apk update && apk add postgresql-client
        yarn typeorm migration:run
        psql $API_POSTGRES_URL < ./test/fixtures/test-data.sql
        exec yarn test:e2e
        ;;
    start)
        echo "Running Start"
        exec yarn start
        ;;

    *)
        exec "$@"
esac
