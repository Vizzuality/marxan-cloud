#!/usr/bin/env bash
airflow db init
airflow webserver
airflow users create -r Admin -u admin -f xx -l test -p pass1234 -e test@vizzuality.com
