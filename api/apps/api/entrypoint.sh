#!/bin/sh
set -e

case "$1" in
    console)
        echo "Running CLI command"
        exec yarn run "$@"
        ;;
    develop)
        echo "Running Development Server"
        exec yarn api:start:dev
        ;;
    test-unit)
        echo "Running Unit Tests"
        exec yarn test:unit:ci apps/api libs
        ;;
    test-e2e)
        echo "Running e2e Tests"
        export API_LOGGING_MUTE_ALL=true
        exec yarn api:test:e2e:new --runInBand --ci --detectOpenHandles --forceExit
        ;;
    run-migrations-for-e2e-tests)
        echo "(ESC)[44m Running migrations (api db) for e2e Tests in Api (ESC)[0m"
        sleep 15
        exec yarn api:typeorm migration:run -t each
        ;;
    start)
        echo "Running Start"
        exec yarn start
        ;;

    *)
        exec "$@"
esac
