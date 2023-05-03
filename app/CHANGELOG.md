# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2023-04-12

### Added
- `tailwindcss` prettier plugin.
- Type checking to `next.config.js`.
- `NEXTAUTH_SECRET` environment variable to README.
- Incremental Typescript builds.

### Changed
- Moved to `next` eslint ruleset.
- Upgrade main dependencies: `node@18.15`, `yarn@3.5.0`, `nextjs@13.2.4`, `next-auth@4.21.1`, `tailwindcss@3.3.1`, `typescript@5.0.3`, `react@18.2.0`, `react-dom@18.2.0`.
- Upgrade other minor dependencies: `axios@1.3.4`, `react-query@3.39.3`, `framer-motion@6.3.15` `cypress@12.9.0`.
- Upgrade `@vizzuality/layer-manager` packages to stable latest stable version as of date (`2.0.3`).
- Upgrade `Dockerfile` to use `node:18.15` and `yarn:3.5.0`.
- Upgrade Github Actions to use `node:18.15` and `yarn:3.5.0` running tests.
- `next-env.d.ts` added to `.gitignore`.
- fresnel: `disableDynamicMediaQueries`.

### Security
- Disabled NextJS powered headers via `poweredByHeader` in `next.config.js`.
