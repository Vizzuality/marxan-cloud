import { BotHttpClient, getJsonApiDataFromResponse } from "./marxan-bot.ts";
import { logError } from "./logger.ts";

export class GeoFeatures {
  private baseHttpClient;

  constructor(httpClient: BotHttpClient) {
    this.baseHttpClient = httpClient.baseHttpClient;
  }

  async getIdFromQueryStringInProject(
    projectId: string,
    name: string,
  ) {
    return await this.baseHttpClient.get(
      `/projects/${projectId}/features?q=${name}&fields=id`,
    )
      .then(getJsonApiDataFromResponse)
      .catch(logError);
  }
}
