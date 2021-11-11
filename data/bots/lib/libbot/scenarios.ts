import Process from "https://deno.land/std@0.103.0/node/process.ts";
import { BotHttpClient, getJsonApiDataFromResponse } from "./marxan-bot.ts";
import { logDebug, logError, logInfo } from "./logger.ts";
import { tookMs } from "./util/perf.ts";

/**
 * The kind of Marxan scenario (standard, Marxan with Zones, and possibly other
 * kinds in the future).
 */
export enum ScenarioType {
  marxan = "marxan",
  marxanWithZones = "marxan-with-zones",
}

export enum IUCNCategory {
  Ia = "Ia",
  Ib = "Ib",
  II = "II",
  III = "III",
  IV = "IV",
  V = "V",
  VI = "VI",
  NotApplicable = "Not Applicable",
  NotAssigned = "Not Assigned",
  NotReported = "Not Reported",
}

interface Scenario {
  name: string;
  type: "marxan";
  description: string;
  wdpaIucnCategories?: IUCNCategory[];
  wdpaThreshold?: number;
  boundaryLengthModifier?: number;
  // @todo probably not: check
  customProtectedAreaIds?: string;
  metadata?: {
    marxanInputParameterFile?: Record<string, string | number>;
    scenarioEditingMetadata?: Record<string, unknown>;
  };
}

export class Scenarios {
  private baseHttpClient;

  constructor(httpClient: BotHttpClient) {
    this.baseHttpClient = httpClient.baseHttpClient;
  }

  async createInProject(projectId: string, scenario: Scenario) {
    const opStart = Process.hrtime();

    const result = await this.baseHttpClient.post("/scenarios", {
      ...scenario,
      projectId,
    })
      .then(getJsonApiDataFromResponse)
      .catch(logError);

    logInfo(`Scenario was created in ${tookMs(Process.hrtime(opStart))}ms.`);
    logDebug(`Scenario:\n${Deno.inspect(result)}`);
    return result;
  }

  async update(scenarioId: string, scenario: Partial<Scenario>) {
    const opStart = Process.hrtime();

    const result = await this.baseHttpClient.patch(
      `/scenarios/${scenarioId}`,
      scenario,
    )
      .then(getJsonApiDataFromResponse)
      .catch(logError);

    logInfo(`Scenario was updated in ${tookMs(Process.hrtime(opStart))}ms.`);
    logDebug(`Scenario:\n${Deno.inspect(result)}`);
    return result;
  }

  async setNumberOfRuns(scenarioId: string, numberOfRuns: number = 100) {
    await this.baseHttpClient.patch(`/scenarios/${scenarioId}`, {
      numberOfRuns,
    });
  }
}
