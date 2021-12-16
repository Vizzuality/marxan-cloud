import Process from "https://deno.land/std@0.103.0/node/process.ts";
import { BotHttpClient, getJsonApiDataFromResponse } from "./marxan-bot.ts";
import { logError, logInfo } from "./logger.ts";
import { tookMs } from "./util/perf.ts";

export class GeoFeatures {
  private baseHttpClient;

  constructor(httpClient: BotHttpClient) {
    this.baseHttpClient = httpClient.baseHttpClient;
  }

  async searchFeaturesWithinProject(
    projectId: string,
    nameFragment: string,
  ): Promise<string[]> {
    const opStart = Process.hrtime();

    const id = await this.baseHttpClient.get(
      `/projects/${projectId}/features?q=${nameFragment}&fields=id`,
    )
      .then(getJsonApiDataFromResponse)
      .then((data: { id: string; type: string }[]) => {
        return data.map((i) => i.id);
      })
      .catch(logError);

    logInfo(
      `Id of feature matching query string ${nameFragment} retrieved in ${
        tookMs(Process.hrtime(opStart))
      }ms.`,
    );

    if (!id || id.length === 0) {
      throw new Error(
        "No feature found with given name: this is probably a bug in this bot",
      );
    }

    return id;
  }
}
