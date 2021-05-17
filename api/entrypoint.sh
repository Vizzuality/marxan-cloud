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
        # exec yarn test:e2e
        exec yarn test:e2e auth
        exec yarn test:e2e countries
        exec yarn test:e2e geo-features
        exec yarn test:e2e json-api
        exec yarn test:e2e organizations
        exec yarn test:e2e planning-units
        exec yarn test:e2e plan.s01e02
        exec yarn test:e2e projects
        exec yarn test:e2e protected-areas
        exec yarn test:e2e proxy.vector-tiles
        exec yarn test:e2e scenarios
        exec yarn test:e2e users
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
