#!/bin/bash
set -e

case "$1" in
    develop)
        if [ $ENABLE_DEBUG_MODE = "true" ]; then
            echo "Running Development Server with inspector"
            exec yarn geoprocessing:start:debug
        else
            echo "Running Development Server"
            exec yarn geoprocessing:start:dev
        fi
        ;;
    test-unit)
        echo "Running Unit Tests"
        exec yarn test:unit:ci apps/geoprocessing libs
        ;;
    test-e2e)
        echo "Running e2e Tests"
        # fall back to ".*" regexp if TEST_SUITE_PATH is not set
        TEST_SUITE_PATH=${TEST_SUITE_PATH:-.*}
        TEST_SUITE_PATH=`sed -e 's|\/|\\\/|g' <<< $TEST_SUITE_PATH`
        exec time yarn geoprocessing:test:e2e --testPathPattern="\/test\/${TEST_SUITE_PATH}\/"
        ;;
    run-migrations-for-e2e-tests)
        echo "(ESC)[44m Running migrations (geoprocessing db) for e2e Tests(ESC)[0m"
        sleep 15
        exec time yarn geoprocessing:typeorm migration:run -t each
        ;;
    start)
        echo "Running Start"
        exec yarn start geoprocessing
        ;;

    *)
        exec "$@"
esac
