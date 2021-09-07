import axiod from "https://deno.land/x/axiod@0.22/mod.ts";
import Process from "https://deno.land/std@0.103.0/node/process.ts";
import { getJsonApiDataFromResponse } from "./marxan-bot.ts";
import { logDebug, logError, logInfo } from "./logger.ts";
import { tookMs } from "./util/perf.ts";
import { MarxanBotConfig } from "./marxan-bot.ts";

export class Users {
  private baseHttpClient;
  private credentials;

  constructor(config: MarxanBotConfig) {
    this.baseHttpClient = axiod.create({
      baseURL: config.apiUrl,
    });

    this.credentials = config.credentials;
  }

  async signUp() {
    const opStart = Process.hrtime();

    const result = await this.baseHttpClient.post(
      "/auth/sign-up",
      {
        email: this.credentials.username,
        password: this.credentials.password,
        displayName: this.credentials.username,
      },
    )
      .then(getJsonApiDataFromResponse)
      .catch(logError);

    logInfo(`User was created in ${tookMs(Process.hrtime(opStart))}ms.`);
    logDebug(`User:\n${Deno.inspect(result)}`);
    return result;
  }
}
