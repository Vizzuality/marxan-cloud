import { BotHttpClient } from "./marxan-bot.ts";
import { logError, logInfo } from "./logger.ts";

export class CostSurface {
  private baseHttpClient;

  constructor(httpClient: BotHttpClient) {
    this.baseHttpClient = httpClient.baseHttpClient;
  }

  async downloadTemplateShapefileForScenarioToFolder(
    scenarioId: string,
    destinationDirName: string,
  ): Promise<boolean> {
    return await this.baseHttpClient.get(
      `/scenarios/${scenarioId}/cost-surface/shapefile-template`,
    )
      .then(async data => {
        const filePath = `${destinationDirName}/${scenarioId}_cost-surface-template.zip`;
        logInfo(`Writing shapefile template to file ${filePath}`);
        const fileBytes = new Uint8Array(new TextEncoder().encode(data.data));
        await this.writeDataToFile(filePath, fileBytes);
      })
      .then(() => true)
      .catch((e) => {
        logError(e);
        return false;
      });
  }

  private async writeDataToFile(filePath: string, data: Uint8Array): Promise<void> {
      await Deno.writeFile(filePath, data);
  }
}