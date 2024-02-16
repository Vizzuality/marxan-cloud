import { Logger } from '@nestjs/common';

type msTime = number;

interface RetryOptions {
  delayMs?: msTime;
  intervalMs: msTime;
  maxTries: number;
}

const sleep = (seconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

export const waitFor = async (
  retryOp: {
    description: string;
    fn: ((...args: unknown[]) => Promise<boolean>) | (() => boolean);
  },
  retryOptions: RetryOptions,
): Promise<boolean> => {
  Logger.debug(`Polling for ${retryOp.description} until complete...`);

  if (retryOptions?.delayMs) {
    const delay = retryOptions.delayMs ?? '0';
    Logger.debug(
      `Waiting for ${delay / 1e3}s before starting to poll status...`,
    );
    await sleep(delay / 1e3);
  }

  const interval = retryOptions.intervalMs;

  for (const i of [...Array(retryOptions.maxTries).keys()]) {
    Logger.debug(`Retry ${i} of ${retryOptions.maxTries}...`);
    const success = await retryOp.fn();
    if (success) {
      Logger.debug(`Callback function succeeded.`);
      return true;
    }
    Logger.debug(`Waiting for ${interval / 1e3}s`);
    await sleep(interval / 1e3);
  }

  return false;
};
