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

In a nutshell, the Marxan solution is composed by the following components:
- A frontend application accessible through the browser - the `app`
- A public, backend API - the `api`
- A geoprocessing-focused service used by the `api` - the `geoprocessing
  api/application`
- An HTML-to-PDF/HTML-to-PNG service - the `webshot` service

Besides these 4, there are other components that may be used in one-off
situations, like seeding source data (see `/data`), testing
(`/e2e-product-testing`) and others.

See [ARCHITECTURE_infrastructure.md](./docs/ARCHITECTURE_infrastructure.md) for
details.

## Dependencies

- [NodeJS](https://nodejs.org/en/) v14.18 and v16.14
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

## Running Marxan using Docker

Before attempting to use the following steps, be sure to:

- Install Docker (19.03+):
- Install [Docker Compose](https://docs.docker.com/compose/install/)
- Create an `.env` at the root of the repository, defining all the required
  [environment variables](./ENV_VARS.md). In most cases, for variables other
  than secrets, the defaults in `env.default` may just work - your mileage may
  vary.

For development environments, a `.env` file can be generated with
default/generated values suitable to run a development instance, via the
following command:

```
make .env
```

This will only generate a file if no `.env` is present in the root of the
repository.

The PostgreSQL credentials set via environment variables are used to create a
database user when the PostgreSQL container is started for the first time.
PostgreSQL data is persisted via a Docker volume.

### Running the Marxan Cloud platform

Run `make start-api` to start all the 4 services needed to run Marxan, as well
as the required database services, in containers via Docker Compose.

The docker build process may take a few minutes, depending on your hardware,
software and internet connection. Once completed, the applications will start,
and you should be able to access the Marxan site on `localhost`, on the port
specified as `APP_SERVICE_PORT`.

### Debugging via Node inspector

To enable the Node inspector while running the MarxanCloud API services in
containers, use `make debug-api` instead. Example configuration
files for debugger setup in popular editors are provided in the
`docs/developers/editors/` documentation folder.

When enabled, the Node inspector will start listening on the default port
`9229/tcp` both in the API and geoprocessing containers, and by default Docker
will forward this port to port `9230/tcp` on the host for the API service, and
to port `9240/tcp` for the geoprocessing service, where the inspector can be
reached by clients.

For security reasons (in case the host is, for example, a VM with a public IP
address and without a firewall in front, for whatever reason), the inspector
port will only be open on the loopback interface.

## Running Marxan natively

Make sure you have installed and configured all the
[dependencies](#Dependencies) locally. PostgreSQL (with PostGIS) and Redis need
to be up and running.

### Running API and Geoprocessing services

When running the API and Geoprocessing services without relying on Docker
Compose for container orchestration, be sure to review and set the correct
[environment variables](./ENV_VARS.md) before executing the application. 
The `env.default` file and the `docker-compose` configuration files may give
you some example values that work for docker-based executions, and that may
be useful when implementing your native execution configuration.

The included Makefile has some useful build targets (commands) specifically
targeted at native execution (prefixed with `native-`) that you'll find helpful.
Refer to the Makefile inline documentation for more details.

If you'd like to run the application directly using Yarn, you can find a 
`package.json` inside the `/app` folder with dependencies and commands for both
applications. After installing the nodejs dependencies, this is how you can 
start either application:

```bash
// Run the API
yarn start

// Run the geoprocessing service
yarn start geoprocessing
```

### Running the Frontend application

The Frontend application can be found in `/app`. Be sure to populate the
`spp/.env` file (note: this is an `.env` file distinct from the top-level `.env`
file which is used to configure backend microservices and data processing
pipelines) according to the [app documentation](./app/README.md), as well as
install the necessary nodejs packages.

To start the application, run:

```bash
yarn dev
```

The frontend app will then be available on http://localhost:3000 (or at the URL
shown when the app starts, if a different port has been configured).

### Running the webshot service

The webshot service can be found in the `/webshot` folder. After installing
the necessary nodejs packages, you can start it by running:

```bash
yarn start:dev
```

Due to upstream packaging of the Chrome browser used by the Webshot service, it
may not be possible to run the webshot service in `aarch64` environments (such
as MacOS on Apple silicon).

### Setting up test seed data

``` bash
make native-seed-api-with-test-data
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

## Seed data

All fresh installations of Marxan (be it locally for development or in a cloud
provider for production) start off with empty databases, that need to be
populated with seed data before the Marxan platform is fully functional. The
seed data you'll want to import will depend on the goal of the installation you
are currently setting up.

Please make sure to wait for all of the backend services (api, geoprocessing and
webshot) to fully start, as database migrations will be run while the services
are started: attempting to import seed data before migrations have run fully
will result in errors.

There are three types of seed data available with the application:

- Geographic data: platform-wide spatial data for admin boundaries (GADM),
  protected areas (WDPA) and conservation features, such as the World
  Terrestrial Ecosystems database. These datasets should be available in every
  Marxan instance.
- User data: user accounts, intended only for development instances and for
  e2e/unit tests; these must not be imported in production-grade environments.
- Test data: intended only for environments where development or e2e/unit tests
  execution takes place, and must not be imported in production-grade
  environments.

Please review the following sections carefully to determine which best fits your
needs for each deployment

### User data

User data is necessary for all types of Marxan installations, but different user
data import processes will best fit different use cases.

There are two ways to create user accounts:

**Using the nodejs CLI**

```bash
cd api
yarn run console create:user EMAIL_ADDRESS PASSWORD [-f, --firstname <first name>] [-l, --lastname <last name>] [-d, --displayname <display name>]
```

**Using Make**

```bash
// For Marxan running on Docker
make seed-api-init-data
// For Marxan running natively
make native-seed-api-init-data
```

The first option will allow you to create a custom user, and is targeted at
environments where user accounts are meaningful - for example, production. To 
execute this on a cloud hosted version of Marxan, you should run the command
above on the VM instance/docker container running the `api` application.

In contrast, the second approach will batch-create several users with insecure 
passwords and generic details, and it's only suited for development, testing
or otherwise ephemeral environments.

### Geographic data

Importing the initial geographic data executes a long-running data ETL pipeline
that imports large amounts of data from publicly available datasets onto
Marxan's PostgreSQL server - using both `api` and `geoprocessing` databases.

First, either set up a new Marxan instance from scratch, or reset an existing
one to a clean-slate status (`make clean-slate && make start-api`) - this allows
to import spatial data into a clean database, avoiding that any user-uploaded
data may end up in seed data.

Once a clean Marxan instance is running, the easiest way to execute the spatial
data import process is using the following `make` task, which runs a dockerized
version of the tool:

``` bash
make seed-geodb-data
```

*Note* this process can complete successfully and exit with code 0, but have
errors in the output logs. This is expected, and said log errors can be ignored.

The actual implementation can be found in the `/data` folder

This will populate the metadata DB and will trigger the geoprocessing ETL
pipelines to seed the geoprocessing DB with the full data that is needed for
production-grade instances of Marxan.

Please note that this full DB set up will require at least 16GB of RAM and 40GB
of disk space in order to carry out some of these tasks (GADM and WDPA data
import pipelines). Also, the number of CPU cores will impact the time needed to
seed a new instance with the complete GADM and WDPA datasets, which will be 1h+ 
on ideal hardware.

To execute this on a cloud hosted version of Marxan, you have a couple of
options:

- Run the import process locally on local running PostgreSQL servers, then
  export the resulting `.sql` locally and import it remotely.
- Run the import process locally, while having it connect directly to the remote
  `api` and `geoprocessing` databases using `kubectl` to set up port forwarding.
  You may need to modify the container's [network
  mode](https://docs.docker.com/compose/compose-file/compose-file-v3/#network_mode)
  to `host` for this to work.

While geographic data is technically necessary on all Marxan environments, there
is a faster alternative to import equivalent data on development/test
environments, which is discussed in the next section.

#### Test data

Test data includes both user data and (a small subset of) the geographical data
described above, as well as extra data necessary to run certain types of
automated tests. This data is meant for development/testing environments only,
and should not be imported in production environments.

```bash
// For Marxan running on Docker
make seed-dbs
// For Marxan running natively
make native-seed-api-init-data
```

These commands will:
- Import generic user data (equivalent to
  `seed-api-init-data`/`native-seed-api-init-data` described above)
- Import a precomputed subset of the geographical data
- Create sample/test Marxan resources, like organizations, scenarios, etc.

## Maintenance

### Resetting data to a clean slate status (docker only)

The main `Makefile` provides a way to reset db instances from scratch. This can
be useful to do regularly, to avoid keeping obsolete data in the local
development instance.

``` bash
make clean-slate
```

### Update seed data (GADM, WDPA) from newer upstream releases

The main `Makefile` provides a set of commands to create new db dumps from
upstream data sources, upload these dumps to an Azure storage bucket, and
populating both dbs from these dumps.

Populating clean dbs this way will be much quicker than triggering the full
[ETL pipelines to import geographic data](#geographic-data).

When uploading new dumps of seed data to an Azure storage container, or when
downloading pre-prepared data seeds from it, the following environment variables
must be defined in the root `.env` file:

```
DATA_SEEDS_AZURE_STORAGE_ACCOUNT_NAME=
DATA_SEEDS_AZURE_STORAGE_CONTAINER_NAME=
```

This will allow to run the `az storage blob` commands in the relevant Make
recipes with suitable authorization.

Users should have suitable access to the storage container configured.

For data uploads, they will need to be logged into an Azure account that is
allowed to write to the container:

- [install the Azure CLI tool
  (`az`)](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
- get an Azure user set up, with suitable permissions to write to the relevant
  Azure storage account and container
- log in to this Azure account via the `az` CLI tool
  (https://learn.microsoft.com/en-us/cli/azure/authenticate-azure-cli)

For data downloads, the container itself needs to be created with "public blobs"
settings so that individual blobs can be fetched via non-authenticated HTTP
requests.

To run the geoprocessing ETL pipelines (such as when using the *Seed data,
option 1* above) to dump data from a previously seeded instance and upload the
processed data to an Azure bucket:

``` bash
make generate-content-dumps && make upload-dump-data
```

Other developers can then benefit from these pre-prepared data seeds when
populating new development instances after their initial setup, by running the
following command on a clean Marxan instance (that is, from empty databases, and
after letting all the migrations run for both `api` and `geoprocessing`
services):

``` bash
make restore-dumps
```

### Running the notebooks

This step is only needed when developing Python notebooks for Marxan.

Run `make notebooks` to start the jupyterlab service.

## Development workflow

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

### Infrastructure

Infrastructure code and documentation can be found under `/infrastructure`

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


## Bugs

Please use the [Marxan Cloud issue
tracker](https://github.com/Vizzuality/marxan-cloud/issues) to report bugs.

## License

(C) Copyright 2020-2023 Vizzuality.

This program is free software: you can redistribute it and/or modify it under
the terms of the [MIT License](LICENSE) as included in this repository.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.  See the [MIT License](LICENSE) for more details.

You should have received a copy of the MIT License along with this program.  If
not, see https://spdx.org/licenses/MIT.html.
