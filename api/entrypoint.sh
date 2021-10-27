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
        echo "Running migrations for e2e Tests"
        sleep 15
        yarn typeorm migration:run
        ;;
    start)
        echo "Running Start"
        exec yarn start
        ;;

    *)
        exec "$@"
esac
