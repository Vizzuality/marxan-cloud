# API - tests

## End to end tests

We handle e2e tests in local dev environments by spinning up a distinct set of
containers that mirror the API and Geoprocessing service ones, alongside their
backing database containers.

The database containers are created with no persisted storage, so once they
are stopped and removed, any test data will be gone.

The same container image used for the development instance of the API is used
for to run the test-e2e instance. The only difference is in the Docker command
used, which instructs the entrypoint script (`entrypoint.sh`) to first run the
db migrations, then seed the db with test data, and eventually runs the tests.

This is not optimal because of the need to install a psql client at runtime, so
it should be reviewed.

### Configuration

In order to keep configuration simple overall, the environment variables through
which the e2e test-related containers are configured (ports, PostgreSQL URLs,
etc.) *are named exactly the same* as the ones used to configure the development
instance of the services, but by using a different dotenv file
(`.env-test-e2e`).

```
cp .env .env-test-e2e
```

In the `.env-test-e2e` file, most of the variables can stay the same as those
used in the main `.env` file, except the ones through which the host port of the
PostgreSQL services is configured: update these two values with port numbers
free on the local machine, for example:

```
POSTGRES_API_SERVICE_PORT=3532
POSTGRES_GEO_SERVICE_PORT=3533
```
### Running e2e tests

Once the testing environment is configured (see above) run the tests:

```
make test-e2e-api
```
