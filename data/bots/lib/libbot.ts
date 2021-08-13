import axiod from "https://deno.land/x/axiod@0.22/mod.ts";

interface MarxanBotConfig {
  apiUrl: string,
  credentials: {
    username: string,
    password: string,
  }
}

interface FileUpload {
  url: string,
  formField: string,
  data: Blob,
  fileName: string,
  headers: [string, string][],
}

const marxanBotBaseSettings = {
  baseUrl: '/api/v1',
}

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

interface Organization {
  name: string,
  description: string,
  metadata: Record<string, unknown>,
}

interface Project {
  name: string,
  countryId?: string,
  adminAreaLevel1Id?: string,
  adminAreaLevel2Id?: string,
  planningUnitGridShape: 'hexagon' | 'square' | 'from_shapefile',
  planningUnitAreakm2: number,
  planningAreaId?: string,
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

export class MarxanUtils {
  constructor(config: MarxanBotConfig, jwt: string) {
    this.baseHttpClient = axiod.create({
      baseURL: config.apiUrl + "/api/v1",
      headers: {
        Authorization: "Bearer " + jwt,
      },
    });
  }

  private baseHttpClient;

  static async init(config: MarxanBotConfig) {
    const jwt = await axiod
      .post(`${config.apiUrl}/auth/sign-in/`, config.credentials)
      .then((result) => result.data.accessToken);

    return new MarxanUtils(config, jwt);
  }

  async sendData(config: FileUpload) {
    const formData = new FormData();
    formData.append(config.formField, config.data, config.fileName);
  
    const response = await fetch(config.url, {
      method: "POST",
      body: formData,
      headers: config.headers,
    });
  
    return response;
  }

  async createOrganization(organization: Organization) {
    return await this.baseHttpClient.post('/organizations', organization)
      .then(result => result.data)
      .catch(e => console.log(e));
  }

  async createProjectInOrganization(project: Project, organizationId: string) {
    return await this.baseHttpClient.post('/projects', { ...project, organizationId })
      .then(result => result.data)
      .catch(e => console.log(e));
  }

  async createScenarioInProject(scenario: Scenario, projectId: string) {
    return await this.baseHttpClient.post('/scenarios', { ...scenario, projectId })
      .then(result => result.data)
      .catch(e => console.log(e))
  }
}