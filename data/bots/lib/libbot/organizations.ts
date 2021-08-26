import { BotHttpClient } from './marxan-bot.ts';

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
      .then(result => result.data)
      .catch(e => console.log(e));
  }
}