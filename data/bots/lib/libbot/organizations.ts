import { BotHttpClient, getJsonApiDataFromResponse } from './marxan-bot.ts';
import { logError } from './logger.ts';

interface Organization {
  name: string,
  description: string,
  metadata?: Record<string, unknown>,
}

export class Organizations {
  private baseHttpClient;

  constructor(httpClient: BotHttpClient) {
    this.baseHttpClient = httpClient.baseHttpClient;
  }

  async create(organization: Organization) {
    return await this.baseHttpClient.post('/organizations', organization)
      .then(getJsonApiDataFromResponse)
      .catch(logError);
  }
}