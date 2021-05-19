#!/bin/sh
set -e

case "$1" in
    develop)
        echo "Running Development Server"
        exec yarn start:dev
        ;;
    test-unit)
        echo "Running Unit Tests"
        exec yarn test:unit:ci
        ;;
    test-e2e)
        echo "Running e2e Tests"
        export API_LOGGING_MUTE_ALL=true
        exec yarn test:e2e --runInBand --ci --detectOpenHandles
        ;;
    run-migrations-for-e2e-tests)
        echo "(ESC)[44m Running migrations (api db) for e2e Tests in Api (ESC)[0m"
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
