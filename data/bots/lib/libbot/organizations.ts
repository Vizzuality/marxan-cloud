import Process from "https://deno.land/std@0.103.0/node/process.ts";
import { BotHttpClient, getJsonApiDataFromResponse } from "./marxan-bot.ts";
import { logError, logInfo } from "./logger.ts";
import { tookMs } from "./util/perf.ts";

interface Organization {
  name: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export class Organizations {
  private baseHttpClient;

  constructor(httpClient: BotHttpClient) {
    this.baseHttpClient = httpClient.baseHttpClient;
  }

  async create(organization: Organization) {
    const opStart = Process.hrtime();

    const result = await this.baseHttpClient.post(
      "/organizations",
      organization,
    )
      .then(getJsonApiDataFromResponse)
      .catch(logError);

    logInfo(
      `Organization was created in ${tookMs(Process.hrtime(opStart))}ms.`,
    );

    return result;
  }
}
