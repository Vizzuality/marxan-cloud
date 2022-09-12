#!/bin/sh
set -e

case "$1" in
    develop)
        echo "Running Development Server"
        exec yarn geoprocessing:start:dev
        ;;
    debug)
        echo "Running Development Server with inspector"
        exec yarn geoprocessing:debug
        ;;
    test-unit)
        echo "Running Unit Tests"
        exec yarn test:unit:ci apps/geoprocessing libs
        ;;
    test-e2e)
        echo "Running e2e Tests"
        exec yarn geoprocessing:test:e2e --runInBand --ci --detectOpenHandles --forceExit
        ;;
    run-migrations-for-e2e-tests)
        echo "(ESC)[44m Running migrations (geoprocessing db) for e2e Tests(ESC)[0m"
        sleep 15
        exec yarn geoprocessing:typeorm migration:run -t each
        ;;
    start)
        echo "Running Start"
        exec yarn start geoprocessing
        ;;

    *)
        exec "$@"
esac
