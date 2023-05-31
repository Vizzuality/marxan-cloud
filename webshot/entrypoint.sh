#!/bin/bash

set -e

case "$1" in
    develop)
        if [ $ENABLE_DEBUG_MODE = "true" ]; then
            echo "Running Development Server with inspector"
            exec yarn start:debug
        else
            echo "Running Development Server"
            exec yarn start:dev
        fi
        ;;
    test)
        echo "Running tests"
        exec yarn test
        ;;
    start)
        echo "Running server"
        exec yarn start
        ;;
    *)
        exec "$@"
esac
