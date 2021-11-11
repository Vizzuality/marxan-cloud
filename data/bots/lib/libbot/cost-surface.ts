import { BotHttpClient } from "./marxan-bot.ts";
import { logError, logInfo } from "./logger.ts";

export class CostSurface {
  private baseHttpClient;

  constructor(httpClient: BotHttpClient) {
    this.baseHttpClient = httpClient.baseHttpClient;
  }

  async getTemplateShapefileForScenario(
    scenarioId: string,
  ) {
    return await this.baseHttpClient.get(
      `/projects/${scenarioId}/cost-surface`,
    )
      .then(data => {
        logInfo('Writing shapefile template to file.');
        await this.writeDataToFile(`./${scenarioId}_cost-surface-template.shp`, data);
      })
      .catch(logError);
  }

  private async writeDataToFile(filePath: string, data: any) {
    const fileBytes = new Uint8Array(await data.arrayBuffer());
    await Deno.writeFile(filePath, data);
}