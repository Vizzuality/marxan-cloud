# Marxan Cloud platform

Welcome to the Marxan Cloud platform. We aim to bring to the planet the finest
workflows for conservation planning.

## Quick start

This repository is a monorepo which includes all the microservices of the Marxan
Cloud platform. Each microservice lives in a top-level folder.

Services are packaged as Docker images.

Microservices are set up to be run via Docker Compose for local development.

In CI, testing, staging and production environments, microservices are
orchestrated via Kubernetes (forthcoming).

## Architecture (TBD)
![Backend architecture](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/Vizzuality/marxan-cloud/develop/marxan-api-architecture.puml)

[Frontend architecture (TBD)]()

![Data management architecture](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/Vizzuality/marxan-cloud/develop/marxan-data-processing-architecture.puml)

[DB data model](https://dbdiagram.io/embed/5ff8693580d742080a358e7f)

### Prerequisites

1. Install Docker (19.03+):
   * [MacOS](https://docs.docker.com/docker-for-mac/)
   * [GNU/Linux](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
2. Install [Docker Compose](https://docs.docker.com/compose/install/)
3. Create an `.env` at the root of the repository, defining all the required
   environment variables listed below. In most cases, for variables other
   than secrets, the defaults in `env.default` may just work - YMMV.

   * `API_AUTH_JWT_SECRET` (string, required): a base64-encoded secret for the
     signing of API JWT tokens; can be generated via a command such as `dd
     if=/dev/urandom bs=1024 count=1 | base64 -w0`
   * `API_SERVICE_PORT` (number, required): the port on which the API service should
     listen on the local machine
   * `API_RUN_MIGRATIONS_ON_STARTUP`: (`true|false`, optional, default is
     `true`): set this to `false` if migrations for the API service should not
     run automatically on startup
   * `APP_SERVICE_PORT` (number, required): the port on which the App service should
     listen on the local machine
   * `POSTGRES_API_SERVICE_PORT` (number, required): the port on which the
     PostgreSQL service should listen on the local machine
   * `API_POSTGRES_USER` (string, required): username to be used for the
     PostgreSQL connection (API)
   * `API_POSTGRES_PASSWORD` (string, required): password to be used for the
     PostgreSQL connection (API)
   * `API_POSTGRES_DB` (string, required): name of the database to be used for
     the PostgreSQL connection (API)
   * `GEOPROCESSING_SERVICE_PORT` (number, required): the port on which the
     Geoprocessing service should listen on the local machine
   * `POSTGRES_GEO_SERVICE_PORT` (number, required): the port on which the
     geoprocessing PostgreSQL service should listen on the local machine
   * `GEOPROCESSING_RUN_MIGRATIONS_ON_STARTUP`: (`true|false`, optional, default
     is `true`): set this to `false` if migrations for the Geoprocessing service
     should not run automatically on startup
   * `GEO_POSTGRES_USER` (string, required): username to be used for the
      geoprocessing PostgreSQL connection (API)
   * `GEO_POSTGRES_PASSWORD` (string, required): password to be used for the
     geoprocessing PostgreSQL connection (API)
   * `GEO_POSTGRES_DB` (string, required): name of the database to be used for
     the geoprocessing PostgreSQL connection (API)
   * `POSTGRES_AIRFLOW_SERVICE_PORT` (number, required): the port on which the
     PostgreSQL for Airflow service should listen on the local machine
   * `AIRFLOW_PORT` (number, required): the port on which the
     Airflow service should listen on the local machine
   * `REDIS_API_SERVICE_PORT` (number, required): the port on which the
     Redis service should listen on the local machine
   * `REDIS_COMMANDER_PORT` (number, required): the port on which the
     Redis Commander service should listen on the local machine
   * `API_LOGGING_MUTE_ALL` (boolean, optional, default is `false`): can be used
     to mute all logging (for example, in CI pipelines) irrespective of Node
     environment and other settings that would normally affect the logging
     verbosity of the API

The PostgreSQL credentials are used to create a database user when the
PostgreSQL container is started for the first time. PostgreSQL data is persisted
via a Docker volume.

### Running the Marxan Cloud platform

Run `make start` to start all the services.

Run `make start-api` to start api services.

### Running the notebooks

Run `make notebooks` to start the jupyterlab service.

### Seed data

To seed the geodb database after a clean state, you need to follow the next instructions:

``` bash
make seed-geodb-data
```
This will populate the metadata DB and will trigger the geo-pipelines to seed the geoDB.  
Note: Full db set up will require at least 16GB of RAM and 40GB of disk space in order to fulfill
some of these tasks (GADM and WDPA data import pipelines). Also the number of
CPU cores will impact the time needed to seed a new instance with the complete
GADM and WDPA datasets.  
___

or if you only wants to populate the newly fresh instance with a small subset of test data:

``` bash
make seed-dbs
```



We also provide a way to freshly clean the dbs instances(we recommend do it regularly):

``` bash
make clean-slate
```

And finally we provided a set of commands to create a new dbs dumps, upload them to an azure instance and restore both dbs
that is faster that triggering the geodb pipes.

``` bash
make generate-content-dumps && make upload-dump-data
```

``` bash
make restore-dumps
```

## Development workflow (TBD)

We use a lightweight git flow workflow. `develop`, `main`, feature/bug fix
branches, release branches (`release/vX.Y.Z-etc`).

Please use per component+task feature branches: `<feature
type>/<component>/NNNN-brief-description`. For example:
`feature/api/12345-helm-setup`.

PRs should be rebased on `develop`.

As feature types:

* `feature`
* `bugfix` (regular bug fix)
* `hotfix` (urgent bug fixes fast-tracked to `main`)

## Bugs

Please use the [Marxan Cloud issue
tracker](https://github.com/Vizzuality/marxan-cloud/issues) to report bugs.

## License

(C) Copyright 2020-2021 Vizzuality.

This program is free software: you can redistribute it and/or modify it under
the terms of the [MIT License](LICENSE) as included in this repository.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.  See the [MIT License](LICENSE) for more details.

You should have received a copy of the MIT License along with this program.  If
not, see https://spdx.org/licenses/MIT.html.
