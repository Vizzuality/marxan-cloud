import { BotHttpClient } from './marxan-bot.ts';

/**
 * The kind of Marxan scenario (standard, Marxan with Zones, and possibly other
 * kinds in the future).
 */
 export enum ScenarioType {
  marxan = 'marxan',
  marxanWithZones = 'marxan-with-zones',
}

export enum IUCNCategory {
  Ia = 'Ia',
  Ib = 'Ib',
  II = 'II',
  III = 'III',
  IV = 'IV',
  V = 'V',
  VI = 'VI',
  NotApplicable = 'Not Applicable',
  NotAssigned = 'Not Assigned',
  NotReported = 'Not Reported',
}

interface Scenario {
  name: string,
  type: 'marxan',
  description: string,
  wdpaIucnCategories?: IUCNCategory[],
  wdpaThreshold: number,
  boundaryLengthModifier?: number,
  // @todo probably not: check
  customProtectedAreaIds: string,
  metadata?: {
    marxanInputParameterFile?: Record<string, string | number>,
    scenarioEditingMetadata?: Record<string, unknown>,
  }
}

export class Scenarios {
  private baseHttpClient;

  constructor(httpClient: BotHttpClient) {
    this.baseHttpClient = httpClient.baseHttpClient;
  }

  async createInProject(projectId: string, scenario: Scenario) {
    return await this.baseHttpClient.post('/scenarios', { ...scenario, projectId })
      .then(result => result.data)
      .catch(e => console.log(e));
  }

  async update(scenarioId: string, scenario: Partial<Scenario>) {
    return await this.baseHttpClient.patch(`/scenarios/${scenarioId}`, scenario)
    .then(result => result.data)
    .catch(e => console.log(e));
  }
}
