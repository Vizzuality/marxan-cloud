import Process from "https://deno.land/std@0.103.0/node/process.ts";
import { BotHttpClient } from "./marxan-bot.ts";
import { IUCNCategory } from "./scenarios.ts";
import { logDebug, logError, logInfo } from "./logger.ts";
import { tookMs } from "./util/perf.ts";

export enum ProtectedAreaKind {
  Global = "global",
  Project = "project",
}

interface ProtectedAreaSelection {
  id: IUCNCategory | string;
  selected: boolean;
}

export interface ProtectedAreaSelectionForScenario {
  areas: ProtectedAreaSelection[];
  threshold?: number;
}

interface ProtectedAreaSelectionResult {
  name: string;
  id: IUCNCategory | string;
  kind: ProtectedAreaKind;
  selected: boolean;
}

export class ProtectedAreas {
  private baseHttpClient;

  constructor(httpClient: BotHttpClient) {
    this.baseHttpClient = httpClient.baseHttpClient;
  }

  async setForScenario(
    scenarioId: string,
    protectedAreas: ProtectedAreaSelectionForScenario,
  ): Promise<ProtectedAreaSelectionResult[]> {
    const opStart = Process.hrtime();

    const result = await this.baseHttpClient.post(
      `/scenarios/${scenarioId}/protected-areas`,
      protectedAreas,
    )
      .then((result) => result?.data.data)
      .catch(logError);

    logInfo(
      `Selection of protected areas for scenarios set in ${
        tookMs(Process.hrtime(opStart))
      }ms.`,
    );
    logDebug(`Protected area selection for scenario:\n${Deno.inspect(result)}`);
    return result;
  }

  async getIucnCategoriesForPlanningAreaWithId(
    protectedAreaId: string,
  ): Promise<IUCNCategory[]> {
    const opStart = Process.hrtime();

    const result = await this.baseHttpClient.get(
      `/protected-areas/iucn-categories?filter[customAreaId]=${protectedAreaId}`,
    )
      .then((result) =>
        result?.data.data?.map((i: { id: IUCNCategory }) => i.id)
      )
      .catch(logError);

    logInfo(
      `Lookup of IUCN categories done in ${tookMs(Process.hrtime(opStart))}ms.`,
    );
    logDebug(`IUCN categories within planning area:\n${Deno.inspect(result)}`);
    return result;
  }

  async getIucnCategoriesForAdminAreaWithId(
    adminAreaId: string,
  ): Promise<IUCNCategory[]> {
    const opStart = Process.hrtime();

    const result = await this.baseHttpClient.get(
      `/protected-areas/iucn-categories?filter[adminAreaId]=${adminAreaId}`,
    )
      .then((result) =>
        result?.data.data?.map((i: { id: IUCNCategory }) => i.id)
      )
      .catch(logError);

    logInfo(
      `Lookup of IUCN categories done in ${tookMs(Process.hrtime(opStart))}ms.`,
    );
    logDebug(`IUCN categories within admin area:\n${Deno.inspect(result)}`);
    return result;
  }
}
