import { BotHttpClient, getJsonApiDataFromResponse } from "./marxan-bot.ts";
import { logError } from "./logger.ts";

export enum SpecificationStatus {
  draft = "draft",
  created = "created",
}

export class GeoFeatureSpecifications {
  private baseHttpClient;

  constructor(httpClient: BotHttpClient) {
    this.baseHttpClient = httpClient.baseHttpClient;
  }

  async submitForScenario(
    scenarioId: string,
    featuresForSpecification: Record<string, unknown>[],
    status: SpecificationStatus = SpecificationStatus.draft,
  ): Promise<void> {
    const specification = {
      status,
      features: featuresForSpecification,
    };

    return await this.baseHttpClient.post(
      `/scenarios/${scenarioId}/features/specification`,
      specification,
    )
      .then(getJsonApiDataFromResponse)
      .catch(logError);
  }
}
