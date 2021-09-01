import { BotHttpClient, getJsonApiDataFromResponse } from "./marxan-bot.ts";
import { logError } from "./logger.ts";

export class MarxanCalculations {
  private baseHttpClient;

  constructor(httpClient: BotHttpClient) {
    this.baseHttpClient = httpClient.baseHttpClient;
  }

  async runForScenario(scenarioId: string) {
    return await this.baseHttpClient.post(`/scenarios/${scenarioId}/marxan`)
      .then(getJsonApiDataFromResponse)
      .catch(logError);
  }
}
