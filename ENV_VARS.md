# Environment variables

This document covers the different [environment
variables](https://en.wikipedia.org/wiki/Environment_variable) supported by
Marxan Cloud and how these affect the behavior of the platform. 


## API and Geoprocessing env vars

These variables
are imported using [node-config](https://www.npmjs.com/package/config) through
[this file](https://github.com/Vizzuality/marxan-cloud/blob/4bcad14eee470e5e403a3949ed25942a229cd2f1/api/apps/api/config/custom-environment-variables.json)
for the API app, and
[this file](https://github.com/Vizzuality/marxan-cloud/blob/4bcad14eee470e5e403a3949ed25942a229cd2f1/api/apps/geoprocessing/config/custom-environment-variables.json)
for the Geoprocessing app. Some environment variables are shared by both
applications.

### API Service

* `API_AUTH_JWT_SECRET` (string, required): a base64-encoded secret for the
  signing of API JWT tokens; can be generated via a command such as `dd
  if=/dev/urandom bs=1024 count=1 | base64 -w0`

* `API_AUTH_X_API_KEY` (string, required): a secret used as API key for
  requests from the Geoprocessing service to the API; can be generated
  similarly to `API_AUTH_JWT_SECRET`

* `API_SERVICE_PORT` (number, optional when running in containers, not
  needed when running natively, default is 3030): the port exposed by Docker for
  the API service; when running an instance under Docker Compose, Express
  will always be listening on port 3000 internally, and this is mapped to
  `API_SERVICE_PORT` on the host.

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

* `API_DAEMON_LISTEN_PORT` (number, optional, default is 3000; this variable is
  only useful when running the service natively, not in a Docker container):
  port on which the Express daemon of the API service will listen. If
  running the API service on the same host as other Marxan backend
  applications, you need to make sure each application listens on a different
  port. When running services in Docker containers, the default should not be
  changed. If you need to expose the daemon on the host, use the
  `API_SERVICE_PORT` environment variable to configure which host port
  should be mapped to the port inside the container (see above).

* `NETWORK_CORS_ORIGINS` (comma-separated list of string origin URLs, optional,
  default is an empty list): whitelisted app origins for requests from the
  in-browser frontend app to the API, required except when accessing the
  frontend app on the default URL defined in `api/apps/api/config/default.json`,
  via the `network.cors.origins` config key

* `CLONING_SIGNING_SECRET` (base64-encoded string, required): this is a
  base64-encoded representation of a PEM-format RSA private key; the key must be
  created without a passphrase, for example via a command such as `openssl
  genrsa 4096 | base64 -w0`.

### PostgreSQL service - API database

* `POSTGRES_API_SERVICE_PORT` (number, optional when running in containers, not
  needed when running natively, default is 3432): the port exposed by Docker for
  the PostgreSQL service (api db)

* `API_POSTGRES_HOST` (string, required): host of the database server to be used
  for the PostgreSQL connection (API)

* `API_POSTGRES_PORT` (number, required): port of the database server to be used
  for the PostgreSQL connection (API)

* `API_POSTGRES_USER` (string, required): username to be used for the PostgreSQL
  connection (API)

* `API_POSTGRES_PASSWORD` (string, required): password to be used for the
  PostgreSQL connection (API)

* `API_POSTGRES_DB` (string, required): name of the database to be used for the
  PostgreSQL connection (API)

* `API_POSTGRES_LOGGING` (string, required): comma separated list of logging
  options to pass to typeorm. [More
  info](https://typeorm.io/#/logging/logging-options)

### Geoprocessing service

* `GEOPROCESSING_SERVICE_PORT` (number, optional when running in containers, not
  needed when running natively, default is 3040): the port exposed by Docker for
  the Geoprocessing service; when running an instance under Docker Compose, Express
  will always be listening on port 3000 internally, and this is mapped to
  `GEOPROCESSING_SERVICE_PORT` on the host.

* `GEOPROCESSING_RUN_MIGRATIONS_ON_STARTUP`: (`true|false`, optional, default
  is `true`): set this to `false` if migrations for the Geoprocessing service
  should not run automatically on startup

* `GEO_DAEMON_LISTEN_PORT` (number, optional, default is 3000; this variable is
  only useful when running the service natively, not in a Docker container):
  port on which the Express daemon of the Geoprocessing service will listen. If
  running the Geoprocessing service on the same host as other Marxan backend
  applications, you need to make sure each application listens on a different
  port. When running services in Docker containers, the default should not be
  changed. If you need to expose the daemon on the host, use the
  `GEOPROCESSING_SERVICE_PORT` environment variable to configure which host port
  should be mapped to the port inside the container (see above).

* `CLEANUP_CRON_INTERVAL` (string, optional, default is 0 0-23/6 * * *):
  String in cron notation for the interval of time where the cleanup will 
  trigger. The default value is every 6 hours.


### PostgreSQL service - Geoprocessing database

* `POSTGRES_GEO_SERVICE_PORT` (number, optional when running in containers, not
  needed when running natively, default is 3433): the port exposed by Docker for
  the PostgreSQL service (geoprocessing db)

* `GEO_POSTGRES_HOST` (string, required): host of the database server to be used
  for the geoprocessing PostgreSQL connection (API)

* `GEO_POSTGRES_PORT` (number, required): port of the database server to be used
  for the geoprocessing PostgreSQL connection (API)

* `GEO_POSTGRES_USER` (string, required): username to be used for the
  geoprocessing PostgreSQL connection (API)

* `GEO_POSTGRES_PASSWORD` (string, required): password to be used for the
  geoprocessing PostgreSQL connection (API)

* `GEO_POSTGRES_DB` (string, required): name of the database to be used for the
  geoprocessing PostgreSQL connection (API)

* `GEO_POSTGRES_LOGGING` (string, required): comma separated list of logging
  options to pass to typeorm. [More
  info](https://typeorm.io/#/logging/logging-options)

### Redis database

* `REDIS_API_SERVICE_PORT` (number, optional when running in containers, not
  needed when running natively, default is 3050): the port exposed by Docker for
  the Redis service; when running an instance under Docker Compose, Redis
  will always be listening on a fixed port internally, and this is mapped to
  `REDIS_API_SERVICE_PORT` on the host.

* `REDIS_COMMANDER_PORT` (number, required if running the Redis Commander
  service through Docker Compose in development environments): the port on which
  the Redis Commander service should listen on the local machine

### Transactional email features (Sparkpost)

* `SPARKPOST_APIKEY` (string, required): an API key to be used for Sparkpost,
  the transactional email service used for email notifications and
  confirmation flows throughout the platform

* `SPARKPOST_ORIGIN` (string, required): the URL of a SparkPost API service:
  this would normally be either `https://api.sparkpost.com` or
  `https://api.eu.sparkpost.com`; please make sure **not to use a
  trailing slash ('`/`') character** or the SparkPost API [client
  library](https://github.com/SparkPost/node-sparkpost) will not be able to
  issue Sparkpost API requests correctly; please check [SparkPost's
  documentation](https://developers.sparkpost.com/api/#header-sparkpost-eu)
  and the client library's own documentation for details

* `APPLICATION_BASE_URL` (string, required): the public URL of the
  **frontend** application on the running instance (without trailing slash).
  This URL will be used to compose links sent via email for some flows of the
  platform, such as password recovery or sign-up confirmation (see also
  `PASSWORD_RESET_TOKEN_PREFIX` and `SIGNUP_CONFIRMATION_TOKEN_PREFIX`)

* `PASSWORD_RESET_TOKEN_PREFIX` (string, required): the path that should be
  appended after the application base URL (`APPLICATION_BASE_URL`),
  corresponding to the **frontend** route where users are redirected from
  password reset emails to complete the process of resetting their
  password; the reset token is appended at the end of this URL to compose
  the actual link that is included in password reset emails

* `PASSWORD_RESET_EXPIRATION` (string, optional, default is 1800000
  milliseconds: 30 minutes): a time (in milliseconds) that a token for a
  password reset is valid for

* `SIGNUP_CONFIRMATION_TOKEN_PREFIX` (string, required): the path that should
  be appended after the application base URL (`APPLICATION_BASE_URL`),
  corresponding to the **frontend** route where users are redirected from
  sign-up confirmation emails to complete the process validating their
  account; the validation token is appended at the end of this URL to compose
  the actual link that is included in sign-up confirmation emails

### Webshot application env vars

* `WEBSHOT_DAEMON_LISTEN_PORT` (number, optional, default is 3000; this variable
  is only useful when running the service natively, not in a Docker container):
  port on which the Express daemon of the Webshot service will listen. If
  running the Webshot service on the same host as other Marxan backend
  applications, you need to make sure each application listens on a different
  port. When running services in Docker containers, the default should not be
  changed. If you need to expose the daemon on the host, use the
  `WEBSHOT_SERVICE_PORT` environment variable to configure which host port
  should be mapped to the port inside the container (see below).

* `WEBSHOT_SERVICE_PORT` (number, optional when running in containers, not
  needed when running natively, default is 3060): the port exposed by Docker for
  the Webshot service; when running an instance under Docker Compose, Express
  will always be listening on port 3000 internally, and this is mapped to
  `WEBSHOT_SERVICE_PORT` on the host.

### Frontend application env vars

* `APP_SERVICE_PORT` (number, optional when running in containers, not needed
  when running natively, default is 3000): the port on which the App service
  should listen on the local machine

The frontend application has its own set of env vars, which are documented
[here](/app/README.md#env-variables).
