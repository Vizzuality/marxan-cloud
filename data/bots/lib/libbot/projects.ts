import { BotHttpClient } from './marxan-bot.ts';

interface Project {
  name: string,
  countryId?: string,
  adminAreaLevel1Id?: string,
  adminAreaLevel2Id?: string,
  planningUnitGridShape: 'hexagon' | 'square' | 'from_shapefile',
  planningUnitAreakm2: number,
  planningAreaId?: string,
}

export class Projects {
  private baseHttpClient;

  constructor(httpClient: BotHttpClient) {
    this.baseHttpClient = httpClient.baseHttpClient;
  }
  
  async createInOrganization(project: Project, organizationId: string) {
    return await this.baseHttpClient.post('/projects', { ...project, organizationId })
      .then(result => result.data)
      .catch(e => console.log(e));
  }

  async checkStatus(id: string) {
    return await this.baseHttpClient.get(`/projects​/${id}​/scenarios​/status`, {})
    .then((result) => result.data)
    .catch((e) => {
        console.log(e);
    });
  }
}