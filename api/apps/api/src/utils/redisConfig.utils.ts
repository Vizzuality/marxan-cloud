import * as config from 'config';
import { QueueBaseOptions } from 'bullmq/dist/interfaces/queue-options';

export function getRedisConfig() {
  const redisConfig: Record<string, any> = config.get('redis');
  const useTLS: boolean = `${redisConfig.useTLS}`.toLowerCase() === 'true';

  const redisSettings: QueueBaseOptions = {
    connection: {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      tls: useTLS ? {} : undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      enableOfflineQueue: true,
      keepAlive: 10000,
      connectTimeout: 10000,
      retryStrategy(times: number) {
        return Math.min(times * 500, 5000);
      },
      reconnectOnError(err: Error) {
        const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
        return targetErrors.some((e) => err.message.includes(e));
      },
    },
  };

  return redisSettings;
}
