# Environment variables

This document covers the different [environment
variables](https://en.wikipedia.org/wiki/Environment_variable) supported by
Marxan Cloud and how these affect the behavior of the platform. These variables
are imported using [node-config](https://www.npmjs.com/package/config) through
[this file](https://github.com/Vizzuality/marxan-cloud/blob/4bcad14eee470e5e403a3949ed25942a229cd2f1/api/apps/api/config/custom-environment-variables.json)
for the API app, and
[this file](https://github.com/Vizzuality/marxan-cloud/blob/4bcad14eee470e5e403a3949ed25942a229cd2f1/api/apps/geoprocessing/config/custom-environment-variables.json)
for the Geoprocessing app. Some environment variables are shared by both
applications.

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
  Docker PostgreSQL service should listen on the local machine
* API PostgreSQL configuration variables:
    * `API_POSTGRES_HOST` (string, required): host of the database server to be
      used for the PostgreSQL connection (API)
    * `API_POSTGRES_PORT` (number, required): port of the database server to be
      used for the PostgreSQL connection (API)
    * `API_POSTGRES_USER` (string, required): username to be used for the
      PostgreSQL connection (API)
    * `API_POSTGRES_PASSWORD` (string, required): password to be used for the
      PostgreSQL connection (API)
    * `API_POSTGRES_DB` (string, required): name of the database to be used for
      the PostgreSQL connection (API)
    * `API_POSTGRES_LOGGING` (string, required): comma separated list of logging
      options to pass to typeorm. [More
      info](https://typeorm.io/#/logging/logging-options)
* `GEOPROCESSING_SERVICE_PORT` (number, required): the port exposed by Docker
  for the Geoprocessing service; when running an instance under Docker
  Compose, NestJS will always be listening on port 3000 internally, and this
  is mapped to `GEOPROCESSING_SERVICE_PORT` when exposed outside of the
  container
* `POSTGRES_GEO_SERVICE_PORT` (number, required): the port on which the
  geoprocessing Docker PostgreSQL service should listen on the local machine
* `GEOPROCESSING_RUN_MIGRATIONS_ON_STARTUP`: (`true|false`, optional, default
  is `true`): set this to `false` if migrations for the Geoprocessing service
  should not run automatically on startup
* Geoprocessing PostgreSQL configuration variables:
    * `GEO_POSTGRES_HOST` (string, required): host of the database server to be
      used for the geoprocessing PostgreSQL connection (API)
    * `GEO_POSTGRES_PORT` (number, required): port of the database server to be
      used for the geoprocessing PostgreSQL connection (API)
    * `GEO_POSTGRES_USER` (string, required): username to be used for the
      geoprocessing PostgreSQL connection (API)
    * `GEO_POSTGRES_PASSWORD` (string, required): password to be used for the
      geoprocessing PostgreSQL connection (API)
    * `GEO_POSTGRES_DB` (string, required): name of the database to be used for
      the geoprocessing PostgreSQL connection (API)
    * `GEO_POSTGRES_LOGGING` (string, required): comma separated list of logging
      options to pass to typeorm. [More
      info](https://typeorm.io/#/logging/logging-options)
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
* `SIGNUP_CONFIRMATION_TOKEN_PREFIX` (string, required): the path that should be
  appended after the application base URL (`APPLICATION_BASE_URL`),
  corresponding to the **frontend** route where users are redirected from
  sign-up confirmation emails to complete the process validating their account;
  the validation token is appended at the end of this URL to compose the actual
  link that is included in sign-up confirmation emails
* `API_DAEMON_LISTEN_PORT` (number, optional, default is 3000): port on which
  the Express daemon of the API service will listen. If running the API on the 
  same host as the Geoprocessing application, you need to modify at least one 
  of the two, so they don't conflict. 
* `GEO_DAEMON_LISTEN_PORT` (number, optional, default is 3000): port
  on which the Express daemon of the Geoprocessing service will listen.
  If running the API on the same host as the Geoprocessing application, you 
  need to modify at least one 
* `WEBSHOT_DAEMON_LISTEN_PORT` (number, optional, default is 3000): port on
  which the Express daemon of the Webshot service will listen. If running the
  Webshot service on the same host as other Marxan backend applications, you
  need to modify at least one.
