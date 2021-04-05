#!/bin/sh
set -e

case "$1" in
    develop)
        echo "Running Development Server"
        exec yarn dev
        ;;
    test-e2e)
        echo "Running e2e Tests"
        exec yarn cy:run
        ;;
    start)
        echo "Running Start"
        exec yarn start
        ;;

    *)
        exec "$@"
esac