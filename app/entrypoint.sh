#!/bin/sh
set -e

case "$1" in
    dummy)
        echo "Running a dummy server"
        exec node dummy.js
        ;;
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
    start)
        echo "Running Start"
        exec yarn start
        ;;

    *)
        exec "$@"
esac
