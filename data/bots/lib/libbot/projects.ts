import Process from "https://deno.land/std@0.103.0/node/process.ts";
import { logDebug, logError, logInfo } from "./logger.ts";
import { BotHttpClient, getJsonApiDataFromResponse } from "./marxan-bot.ts";
import { tookMs } from "./util/perf.ts";

interface Project {
  name: string;
  description: string;
  countryId?: string;
  adminAreaLevel1Id?: string;
  adminAreaLevel2Id?: string;
  planningUnitGridShape: "hexagon" | "square" | "from_shapefile";
  planningUnitAreakm2?: number;
  planningAreaId?: string;
}

export class Projects {
  private baseHttpClient;

  constructor(httpClient: BotHttpClient) {
    this.baseHttpClient = httpClient.baseHttpClient;
  }

  async createInOrganization(organizationId: string, project: Project) {
    const opStart = Process.hrtime();

    const result = await this.baseHttpClient.post("/projects", {
      ...project,
      organizationId,
    })
      .then(getJsonApiDataFromResponse)
      .catch(logError);

    logInfo(`Project was created in ${tookMs(Process.hrtime(opStart))}ms.`);
    logDebug(`Project:\n${Deno.inspect(result)}`);

    return result;
  }

  async update(projectId: string, project: Partial<Project>) {
    const opStart = Process.hrtime();

    const result = await this.baseHttpClient.patch(
      `/projects/${projectId}`,
      project,
    )
      .then(getJsonApiDataFromResponse)
      .catch(logError);

    logInfo(`Project was updated in ${tookMs(Process.hrtime(opStart))}ms.`);
    logDebug(`Project:\n${Deno.inspect(result)}`);

    return result;
  }

  async checkStatus(id: string) {
    return await this.baseHttpClient.get(
      `/projects​/${id}​/scenarios​/status`,
      {},
    )
      .then(getJsonApiDataFromResponse)
      .catch(logError);
  }
}
