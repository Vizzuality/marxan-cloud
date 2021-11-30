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

## Platform architecture

See [ARCHITECTURE_infrastructure.md](./docs/ARCHITECTURE_infrastructure.md) for
details.

![Backend architecture](./docs/ARCHITECTURE_infrastructure/marxan-contexts.png)

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
   * `API_AUTH_X_API_KEY` (string, required): a secret used as API key for
     requests from the Geoprocessing service to the API; can be generated
     similarly to `API_AUTH_JWT_SECRET`
   * `API_SERVICE_PORT` (number, required): the port exposed by Docker for the
     API service; when running an instance under Docker Compose, NestJS will
     always be listening on port 3000 internally, and this is mapped to
     `API_SERVICE_PORT` when exposed outside of the container
   * `API_SERVICE_URL` (URL, optional, default is http://api:3000): the internal
     (docker-compose or k8s cluster) where the API service can be reached by
     other services running in the cluster
   * `API_RUN_MIGRATIONS_ON_STARTUP`: (`true|false`, optional, default is
     `true`): set this to `false` if migrations for the API service should not
     run automatically on startup
   * `API_LOGGING_MUTE_ALL` (boolean, optional, default is `false`): can be used
     to mute all logging (for example, in CI pipelines) irrespective of Node
     environment and other settings that would normally affect the logging
     verbosity of the API
   * `API_SHARED_FILE_STORAGE_LOCAL_PATH` (string, optional, default is
     `/tmp/storage`): set this to a filesystem path if needing to override the
     default temporary storage location where shared volumes for files shared
     from the API to the Geoprocessing service are mounted; configuration of
     mount point for shared storage (via Docker volumes in development
     environments and via Persistent Volumes in Kubernetes environments) should
     be set accordingly
   * `APP_SERVICE_PORT` (number, required): the port on which the App service
     should listen on the local machine
   * `POSTGRES_API_SERVICE_PORT` (number, required): the port on which the
     PostgreSQL service should listen on the local machine
   * `API_POSTGRES_USER` (string, required): username to be used for the
     PostgreSQL connection (API)
   * `API_POSTGRES_PASSWORD` (string, required): password to be used for the
     PostgreSQL connection (API)
   * `API_POSTGRES_DB` (string, required): name of the database to be used for
     the PostgreSQL connection (API)
   * `GEOPROCESSING_SERVICE_PORT` (number, required): the port exposed by Docker
     for the Geoprocessing service; when running an instance under Docker
     Compose, NestJS will always be listening on port 3000 internally, and this
     is mapped to `GEOPROCESSING_SERVICE_PORT` when exposed outside of the
     container
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
   * `SPARKPOST_APIKEY` (string, required): an API key to be used for Sparkpost, 
     an email service
   * `SPARKPOST_ORIGIN` (string, required): the URL of a SparkPost API service:
     this would normally be either `https://api.sparkpost.com` or
     `https://api.eu.sparkpost.com` (note: **no trailing `/` character** or the
     SparkPost API [client library](https://github.com/SparkPost/node-sparkpost)
     will not work correctly); please check [SparkPost's
     documentation](https://developers.sparkpost.com/api/#header-sparkpost-eu)
     and the client library's own documentation for details
   * `PASSWORD_RESET_TOKEN_PREFIX` (string, required): the public URL of the
     **frontend** page on the running instance where users are redirected from
     password reset emails to complete the process of resetting their
     password; the reset token is appended at the end of this URL to compose
     the actual link that is included in password reset emails
   * `PASSWORD_RESET_EXPIRATION` (string, optional, default is 1800000
     milliseconds: 30 minutes): a time (in milliseconds) that a token for a
     password reset is valid for
   * `SIGNUP_CONFIRMATION_TOKEN_PREFIX` (string, required): the public URL of the
     **frontend** page on the running instance where users are redirected from
     sign-up confirmation emails to complete the process validating their account; 
     the validation token is appended at the end of this URL to compose the actual 
     link that is included in sign-up confirmation emails

The PostgreSQL credentials are used to create a database user when the
PostgreSQL container is started for the first time. PostgreSQL data is persisted
via a Docker volume.

#### Running API and Geoprocessing services natively

When running the API and Geoprocessing services without relying on Docker
Compose for container orchestration, the following two environment variables can
be used to set on which port the NestJS/Express daemon should be listening,
instead of the hardcoded port `3000` which is used in Docker setups.

* `API_DAEMON_LISTEN_PORT` (number, optional, default is 3000): port on which
  the Express daemon of the API service will listen
* `GEOPROCESSING_DAEMON_LISTEN_PORT` (number, optional, default is 3000): port
  on which the Express daemon of the Geoprocessing service will listen

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
