#!/bin/sh

ls /opt/marxan-project-cloning | sort > /tmp/storage/<gc-task-id>_all-uuids.list

comm -3 /tmp/storage/<gc-task-id>_all-uuids.list tmp/storage/_valid-uuids.list | xargs rm -rf

rm /tmp/storage/<gc-task-id>*
