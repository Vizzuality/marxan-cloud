#!/bin/sh
set -e

case "$1" in
    develop)
        echo "Running Development Server"
        exec yarn geoprocessing:start:dev
        ;;
    test-unit)
        echo "Running Unit Tests"
        exec yarn test:unit:ci apps/geoprocessing libs
        ;;
    test-e2e)
        echo "Running e2e Tests"
        export API_LOGGING_MUTE_ALL=true
        export NODE_ENV=test
        exec yarn geoprocessing:test:e2e --ci --detectOpenHandles --forceExit
        ;;
    run-migrations-for-e2e-tests)
        echo "(ESC)[44m Running migrations (geoprocessing db) for e2e Tests(ESC)[0m"
        sleep 15
        export NODE_ENV=test
        exec yarn geoprocessing:typeorm migration:run -t each
        ;;
    start)
        echo "Running Start"
        exec yarn start geoprocessing
        ;;

    *)
        exec "$@"
esac
