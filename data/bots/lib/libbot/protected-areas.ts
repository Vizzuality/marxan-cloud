import Process from "https://deno.land/std@0.103.0/node/process.ts";
import { BotHttpClient } from './marxan-bot.ts';
import { IUCNCategory } from './scenarios.ts';
import { logDebug, logInfo, logError } from './logger.ts';
import { tookMs } from './util/perf.ts';

export class ProtectedAreas {
  private baseHttpClient;

  constructor(httpClient: BotHttpClient) {
    this.baseHttpClient = httpClient.baseHttpClient;
  }

  async getIucnCategoriesForPlanningAreaWithId(protectedAreaId: string): Promise<IUCNCategory[]> {
    const opStart = Process.hrtime();

    const result = await this.baseHttpClient.get(`/protected-areas/iucn-categories?filter[customAreaId]=${protectedAreaId}`)
      .then(result => result?.data.data?.map((i: { id: IUCNCategory }) => i.id))
      .catch(logError);

    logInfo(`Lookup of IUCN categories done in ${tookMs(Process.hrtime(opStart))}ms.`)
    logDebug(`IUCN categories within planning area:\n${Deno.inspect(result)}`);
    return result;
  }
}
