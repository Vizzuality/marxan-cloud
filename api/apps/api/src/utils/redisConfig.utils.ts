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
      tls: useTLS
        ? {
            host: redisConfig.host,
            port: redisConfig.port,
          }
        : undefined,
    },
  };

  return redisSettings;
}
