#!/bin/bash
set -e

case "$1" in
    console)
        echo "Running CLI command"
        exec yarn run "$@"
        ;;
    develop)
        if [ $ENABLE_DEBUG_MODE = "true" ]; then
            echo "Running Development Server with inspector"
            exec yarn api:start:debug
        else
            echo "Running Development Server"
            exec yarn api:start:dev
        fi
        ;;
    test-unit)
        echo "Running Unit Tests"
        exec yarn test:unit:ci apps/api libs
        ;;
    test-e2e)
        echo "Running e2e Tests"
        export API_LOGGING_MUTE_ALL=true
        # fall back to ".*" regexp if TEST_SUITE_PATH is not set
        TEST_SUITE_PATH=${TEST_SUITE_PATH:-.*}
        TEST_SUITE_PATH=`sed -e 's|\/|\\\/|g' <<< $TEST_SUITE_PATH`
        exec time yarn api:test:e2e --testPathPattern="\/test\/${TEST_SUITE_PATH}\/"
        ;;
    # TODO: This might be redundant / unnecessary
    run-migrations-for-e2e-tests)
        echo "(ESC)[44m Running migrations (api db) for e2e Tests in Api (ESC)[0m"
        sleep 15
        export NODE_ENV=test
        exec time yarn api:typeorm migration:run -t each
        ;;
    start)
        echo "Running Start"
        exec yarn start
        ;;

    *)
        exec "$@"
esac
