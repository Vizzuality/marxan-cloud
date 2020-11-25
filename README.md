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

### Prerequisites

1. Install Docker (19.03+):
   * [MacOS](https://docs.docker.com/docker-for-mac/)
   * [GNU/Linux](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
2. Install [Docker Compose](https://docs.docker.com/compose/install/)
3. Create an `.env` at the root of the repository, defining all the required
   environment variables listed below. In most cases, for variables other
   than secrets, the defaults in `env.default` may just work - YMMV.

   * `API_PORT` (number, required): the port on which the API service should
     listen on the local machine
   * `APP_PORT` (number, required): the port on which the App service should
     listen on the local machine

4. Create a Docker network for the local instance of the Marxan platform:
   `docker network create marxan-cloud-network`.

### Running the Marxan Cloud platform

Run `make start` to start all the services.

## Bugs

Please use the [Marxan Cloud issue
tracker](https://github.com/marxanweb/marxan-server/issues) to report bugs.

## License

(C) Copyright 2020 Vizzuality.

This program is free software: you can redistribute it and/or modify it under
the terms of the [MIT License](LICENSE) as included in this repository.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.  See the [MIT License](LICENSE) for more details.

You should have received a copy of the MIT License along with this program.  If
not, see https://spdx.org/licenses/MIT.html.
