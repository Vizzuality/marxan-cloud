import { getRedisConfig } from './redisConfig.utils';

jest.mock('config', () => ({
  get: (key: string) => {
    const cfg: Record<string, any> = {
      redis: {
        host: 'test-host',
        port: 6380,
        password: 'test-pass',
        useTLS: 'false',
      },
    };
    return cfg[key];
  },
}));

describe('getRedisConfig', () => {
  it('should return connection with host, port, and password from config', () => {
    const result = getRedisConfig();
    expect(result.connection).toMatchObject({
      host: 'test-host',
      port: 6380,
      password: 'test-pass',
    });
  });

  it('should set tls to undefined when useTLS is false', () => {
    const conn = getRedisConfig().connection as any;
    expect(conn.tls).toBeUndefined();
  });

  describe('resilience options', () => {
    it('should set maxRetriesPerRequest to null for infinite retries', () => {
      const conn = getRedisConfig().connection as any;
      expect(conn.maxRetriesPerRequest).toBeNull();
    });

    it('should disable ready check', () => {
      const conn = getRedisConfig().connection as any;
      expect(conn.enableReadyCheck).toBe(false);
    });

    it('should enable offline queue', () => {
      const conn = getRedisConfig().connection as any;
      expect(conn.enableOfflineQueue).toBe(true);
    });

    it('should set keepAlive to 10 seconds', () => {
      const conn = getRedisConfig().connection as any;
      expect(conn.keepAlive).toBe(10000);
    });

    it('should set connectTimeout to 10 seconds', () => {
      const conn = getRedisConfig().connection as any;
      expect(conn.connectTimeout).toBe(10000);
    });
  });

  describe('retryStrategy', () => {
    it('should use exponential backoff capped at 5 seconds', () => {
      const conn = getRedisConfig().connection as any;
      const retryStrategy = conn.retryStrategy as (times: number) => number;

      expect(retryStrategy(1)).toBe(500);
      expect(retryStrategy(2)).toBe(1000);
      expect(retryStrategy(5)).toBe(2500);
      expect(retryStrategy(10)).toBe(5000);
      expect(retryStrategy(100)).toBe(5000);
    });
  });

  describe('reconnectOnError', () => {
    let reconnectOnError: (err: Error) => boolean;

    beforeEach(() => {
      const conn = getRedisConfig().connection as any;
      reconnectOnError = conn.reconnectOnError;
    });

    it('should reconnect on READONLY errors (Azure failover)', () => {
      expect(reconnectOnError(new Error('READONLY You cannot write'))).toBe(
        true,
      );
    });

    it('should reconnect on ECONNRESET errors', () => {
      expect(reconnectOnError(new Error('read ECONNRESET'))).toBe(true);
    });

    it('should reconnect on ETIMEDOUT errors', () => {
      expect(reconnectOnError(new Error('connect ETIMEDOUT'))).toBe(true);
    });

    it('should not reconnect on unrelated errors', () => {
      expect(reconnectOnError(new Error('some other error'))).toBe(false);
    });
  });
});

describe('getRedisConfig with TLS enabled', () => {
  beforeAll(() => {
    jest.resetModules();
  });

  it('should set tls to empty object when useTLS is true', () => {
    jest.doMock('config', () => ({
      get: () => ({
        host: 'test-host',
        port: 6380,
        password: 'test-pass',
        useTLS: 'true',
      }),
    }));

    const {
      getRedisConfig: getRedisConfigWithTLS,
    } = require('./redisConfig.utils');
    const result = getRedisConfigWithTLS();
    expect((result.connection as any).tls).toEqual({});
  });
});
