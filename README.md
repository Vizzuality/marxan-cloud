# Marxan Cloud platform

Welcome to the Marxan Cloud platform. We aim to bring to the planet the finest
workflows for conservation planning.

## Quick start

This repository is a monorepo which includes all the microservices of the Marxan
Cloud platform. Each microservice lives in a top-level folder.

Services are packaged as Docker images.

Microservices are set up to be run with or without Docker Compose for local 
development - see the sections below for more details.

The recommended setup for new developers is to run all the backend services (api
and geoprocessing services, alongside their PostgreSQL and Redis databases) via
Docker Compose, and the frontend app natively.

In CI, testing, staging and production environments, microservices are
orchestrated via Kubernetes (see [the relevant
documentation](./infrastructure/README.md)).

Most of the commands listed in this README and referenced elsewhere in the
repository are targeted at a GNU/Linux OS environment such as a recent Ubuntu,
Arch or Debian system, whether running natively or in a VM or under Windows
Subsystem for Linux 2 (WSL 2). They should also work identically on MacOS, while
they may need some adaptation to run on Windows systems.

## Platform architecture

See [ARCHITECTURE_infrastructure.md](./docs/ARCHITECTURE_infrastructure.md) for
details.

![Backend architecture](./docs/ARCHITECTURE_infrastructure/marxan-contexts.png)

## Dependencies

- [NodeJS](https://nodejs.org/en/) v14.18
- [Yarn](https://classic.yarnpkg.com/) v1
- [PostgreSQL](https://www.postgresql.org/) v14
- [Postgis](https://postgis.net/) v3
- [Redis](https://redis.io/) v6
- A [Sparkpost](https://www.sparkpost.com/) account

For development environments, a separate Sparkpost account than what is used for
staging/production should be used. Unless the transactional email components of
the platform are being actively worked on (email verification on signup, email
confirmation for password changes, email flow for resetting forgotten passwords,
etc.), there will be no need to set up email templates within the Sparkpost
account, and only a Sparkpost API key will be needed (see documentation on
[environment variables](./ENV_VARS.md) for details on this).

## Running API and Geoprocessing services using Docker

1. Install Docker (19.03+):
	* [MacOS](https://docs.docker.com/docker-for-mac/)
	* [GNU/Linux](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
2. Install [Docker Compose](https://docs.docker.com/compose/install/)
3. Create an `.env` at the root of the repository, defining all the required
   [environment variables](./ENV_VARS.md). In most cases, for variables other
   than secrets, the defaults in `env.default` may just work - your mileage may vary.

The PostgreSQL credentials are used to create a database user when the
PostgreSQL container is started for the first time. PostgreSQL data is persisted
via a Docker volume.

### Running the Marxan Cloud platform

Run `make start-api` to start all the backend services and all the required
database services.

To run the frontend app, populate the `app/.env` file according to the [app
documentation](./app/README.md), then:


```
npm install -g yarn
cd app
nvm use ## or fnm use, etc. according to the preferred node version manager
yarn install
yarn dev
```

The frontend app will then be available on http://localhost:3000 (or at the URL
shown when the app starts, if a different port has been configured).

### Seeding a new instance with initial data

Once all the backend services have started for the first time, initial seed data
must be imported into the new instance. Likewise, after resetting an instance
via `make clean-slate`, this step must be repeated after having started the
backend services.

Please make sure to wait for all of the backend services (api, geoprocessing and
webshot) to fully start as database migrations will be run while the services
are started: attempting to import seed data before migrations have run fully
will result in errors.

Importing initial seed data can be done in two distinct ways:

1. Full data (recommended in most cases)

``` bash
make seed-geodb-data
```

This will populate the metadata DB and will trigger the geoprocessing ETL
pipelines to seed the geoDB with the full data that would normally be used in
staging and production instances.

Please note that this full db set up will require at least 16GB of RAM and 40GB
of disk space in order to carry out some of these tasks (GADM and WDPA data
import pipelines). Also, the number of CPU cores will impact the time needed to
seed a new instance with the complete GADM and WDPA datasets.

2. Small subset of test data

To populate a new instance with a small subset of test data, instead, the
following command can be used:

``` bash
make seed-dbs
```

## Running API and Geoprocessing services natively

Make sure you have installed and configured all the [dependencies](#Dependencies) 
locally. PostgreSQL (with PostGIS) and Redis need to be up and running.

When running the API and Geoprocessing services without relying on Docker
Compose for container orchestration, be sure to review and set the correct
[environment variables](./ENV_VARS.md) before executing the application. 
The `env.default` file and the `docker-compose` configuration files may give
you some example values that work for docker-based executions, and that may
be useful when implementing your native execution configuration.

The included Makefile has some useful build targets (commands) specifically
targeted at native execution (prefixed with `native-`) that you'll find helpful.
Refer to the Makefile inline documentation for more details.

### Setting up test seed data

``` bash
make native-seed-api-with-test-data
```

### Running the API/Geoprocessing

You can find the source code for the API/Geoprocessing applications inside the
`api` folder.

Be sure to install the necessary `nodejs` dependencies using `yarn` prior to
running the applications

To start the API, run:

``` bash
yarn start
```

To start the Geoprocessing application, run:

``` bash
yarn start geoprocessing
```

### Running tests

Running the whole test suite requires running 3 commands, each focused on a
specific type of test:

To run the unit tests for both the API and the Geoprocessing app:
``` bash
yarn run test
```

To run the E2E tests for the API:
``` bash
yarn run api:test:e2e
```

To run the E2E tests for the Geoprocessing app:

``` bash
yarn run geoprocessing:test:e2e
```

Note that E2E tests may trigger cross-application requests, so:
- When running E2E tests for the API, you must have the Geoprocessing
  application running in the background.
- When running E2E tests for the Geoprocessing application, you must have the
  API running in the background.

Running tests require previously loading the [test seed
data](#setting-up-test-seed-data), and may modify data in the database - do not
run tests using a database whose data you don't want to lose.

## Maintenance

### Resetting data to a clean slate status

The main `Makefile` provides a way to reset db instances from scratch. This can
be useful to do regularly, to avoid keeping obsolete data in the local
development instance.

``` bash
make clean-slate
```

### Update seed data (GADM, WDPA) from newer upstream releases

The main `Makefile` provides a set of commands to create new dbs dumps from
upstream data sources, upload these dumps to an Azure storage bucket, and
populating both dbs from these dumps. Populating clean dbs this way will
typically be faster than triggering the full geodb ETL pipelines.

To run the geoprocessing ETL pipelines (such as when using the *Seed data,
option 1* above) and upload the processed data to an Azure bucket:

``` bash
make generate-content-dumps && make upload-dump-data
```

Other developers can then benefit from the pre-prepared data seeds when
populating new development instances after their initial setup:

``` bash
make restore-dumps
```

### Running the notebooks

This step is only needed when developing Python notebooks for Marxan.

Run `make notebooks` to start the jupyterlab service.

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

## Devops

### CI/CD

[CI/CD](https://www.redhat.com/en/topics/devops/what-is-ci-cd) is handled with 
[GitHub Actions](https://github.com/features/actions). More details can be found 
by reviewing the actual content of the `.github/workflows` folder but, in a nutshell, 
GitHub Action will automatically run tests on code pushed as part of a Pull Request.

For code merged to key branches (currently `main` and `develop`), once tests run
successfully, [Docker](https://www.docker.com/) images are built and pushed to a 
private [Azure Container Registry](https://azure.microsoft.com/en-us/services/container-registry/).

The GitHub Actions workflows currently configured requires a few [secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
to be set on GitHub in order to work properly:

- `AZURE_CLIENT_ID`: Obtain from Terraform's `azure_client_id` output
- `AZURE_TENANT_ID`: Obtain from Terraform's `azure_tenant_id` output
- `AZURE_SUBSCRIPTION_ID`: Obtain from Terraform's `azure_subscription_id` output
- `REGISTRY_LOGIN_SERVER`: Obtain from Terraform's `azurerm_container_registry_login_server` output
- `REGISTRY_USERNAME`: Obtain from Terraform's `azure_client_id` output
- `REGISTRY_PASSWORD`: Obtain from Terraform's `azuread_application_password` output

Some of these values are obtained from Terraform output values, which will be documented
in more detail in the [Infrastructure](#infrastructure) docs.


### Infrastructure

Infrastructure code and documentation can be found under `/infrastructure`

## Bugs

Please use the [Marxan Cloud issue
tracker](https://github.com/Vizzuality/marxan-cloud/issues) to report bugs.

## License

(C) Copyright 2020-2022 Vizzuality.

This program is free software: you can redistribute it and/or modify it under
the terms of the [MIT License](LICENSE) as included in this repository.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.  See the [MIT License](LICENSE) for more details.

You should have received a copy of the MIT License along with this program.  If
not, see https://spdx.org/licenses/MIT.html.
