# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic
Versioning](https://semver.org/spec/v2.0.0.html).


## [0.0.1]

Unreleased

### Added

- Admin Areas
  - list by country [MARXAN-135]
  - search by level 1 or level 2 id
- Countries
  - move to geoprocessingDB
  - handle as subset of Admin Areas

### Changed

- Refactor processing of JSON:API fetch specifications (depends on
  `nestjs-base-service >= 0.3.0`).

### Fixed

### Deprecated

### Removed


## [0.0.0.1]

2021-02-22

Initial release. Originally labelled 0.1.0, though we decided to start from
0.0.1 for the first proper sprint, so this will be 0.0.0.1 🚀.

### Added

- API scaffolding.
  - Base setup.
  - OpenAPI plugin.
  - CORS origin configuration
  - Helmet
  - (development environments) Type coverage report
- Stub `UsersModule`.
  - Get users
  - Get current user info (`/users/me`)
- Stub `ProjectsModule`.
- Stub `ScenariosModule`.
- Stub `OrganizationsModule`.
- Stub roles.
- PoC JSON:API serialization.
- Authentication
  - local authentication strategy (username+password)
  - JWT tokens are issued
  - initial support for JWT token invalidation
  - refresh of a still-valid JWT token
- Ping/liveness endpoint.
- NestJS services are based on `nestjs-base-service`.
- Integration with faker.js for mock data.
- Shared ORM config setup, allowing to use multiple connections in NestJS as
  well as via the TypeORM CLI util.
- Setup of E2E tests.
- Support for pagination of plural responses.
- Catch-all error handling via exception filter.
- Serialization of error response payloads as JSON:API errors.
- Countries: findAll, findOne.
