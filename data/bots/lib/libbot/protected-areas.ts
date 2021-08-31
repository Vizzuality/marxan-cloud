import { BotHttpClient, getJsonApiDataFromResponse } from './marxan-bot.ts';
import { IUCNCategory } from './scenarios.ts';
import { logError } from './logger.ts';

export class ProtectedAreas {
  private baseHttpClient;

  constructor(httpClient: BotHttpClient) {
    this.baseHttpClient = httpClient.baseHttpClient;
  }

  async getIucnCategoriesForPlanningAreaWithId(protectedAreaId: string): Promise<IUCNCategory[]> {
    return await this.baseHttpClient.get(`/protected-areas/iucn-categories?filter[customAreaId]=${protectedAreaId}`)
      .then(result => result?.data.data?.map((i: { id: IUCNCategory }) => i.id))
      .catch(logError);
  }
}
