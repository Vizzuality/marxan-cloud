const extraCorsOrigin = 'https://marxan.cloud.example.com';
// This env var needs to be set *before* importing `config` (indirectly here
// through `AppConfig`): setting this via a `beforeAll()` will result in the env
// var to be available in the `it()` scope, *but not* to calls of
// `config.get()`.
process.env.NETWORK_CORS_ORIGINS = extraCorsOrigin;

import { AppConfig } from './config.utils';

describe('AppConfig', () => {
  beforeAll(() => {
    if (process.env.NODE_CONFIG_DIR !== 'apps/api/config') {
      throw Error(
        `Running the test suite with NODE_CONFIG_DIR=${process.env.NODE_CONFIG_DIR}, which may cause this test to fail. Please use NODE_CONFIG_DIR=apps/api/config.`,
      );
    }
  });

  describe('getFromArrayAndParsedString', () => {
    // Expected full result from `network.cors.origins`. If updating the default
    // list in `config`, relevant tests should break and this list should be
    // updated accordingly.
    const result = ['http://localhost:3010'];

    it('should accept a single array parameter', () => {
      expect(
        AppConfig.getFromArrayAndParsedString('network.cors.origins'),
      ).toContain(result[0]);
    });

    it('should return an empty list if no valid config property is provided', () => {
      expect(
        AppConfig.getFromArrayAndParsedString(
          Math.random().toString(36).substring(32),
        ),
      ).toHaveLength(0);
    });

    it('should return the default list if a stringProperty not matching a valid config property is used', () => {
      expect(
        AppConfig.getFromArrayAndParsedString(
          'network.cors.origins',
          Math.random().toString(36).substring(32),
        ),
      ).toHaveLength(result.length);
    });

    it('should include values from the NETWORK_CORS_ORIGINS env var if called with `network.cors.origins_extra` as stringProperty', () => {
      expect(
        AppConfig.getFromArrayAndParsedString(
          'network.cors.origins',
          'network.cors.origins_extra',
        ),
      ).toContain(extraCorsOrigin);
    });
  });
});
