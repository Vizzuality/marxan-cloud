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
        exec yarn test:e2e
        ;;
    run-migrations-for-e2e-tests)
        echo "(ESC)[44m Running migrations (geoprocessing db) for e2e Tests(ESC)[0m"
        env | grep -v SECRET | grep -v PASSWORD | grep -v KEY
        sleep 15
        exec yarn typeorm migration:run
        ;;
    start)
        echo "Running Start"
        exec yarn start
        ;;

    *)
        exec "$@"
esac
