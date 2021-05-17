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
        yarn test:e2e auth
        yarn test:e2e countries
        yarn test:e2e geo-features
        yarn test:e2e json-api
        yarn test:e2e organizations
        yarn test:e2e planning-units
        yarn test:e2e plan.s01e02
        yarn test:e2e projects
        yarn test:e2e protected-areas
        yarn test:e2e proxy.vector-tiles
        yarn test:e2e scenarios
        yarn test:e2e users
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
