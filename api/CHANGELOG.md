# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic
Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0]

Unreleased

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

### Changed

### Fixed

### Deprecated

### Removed

