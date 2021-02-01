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
        # @debt This feels a bit hacky. It slows down the tests, and couples
        # this script to an Alpine-based image. We should install
        # `postgresql-client` during image build (in the Dockerfile), maybe via
        # a `RUN` directive with a conditional shell statement that only
        # installs the package if a specific build argument or env var is set.
        apk update && apk add postgresql-client
        yarn typeorm migration:run
        psql $API_POSTGRES_URL < ./test/fixtures/test-data.sql
        exec yarn test:e2e
        ;;
    start)
        echo "Running Start"
        exec yarn start
        ;;

    *)
        exec "$@"
esac
