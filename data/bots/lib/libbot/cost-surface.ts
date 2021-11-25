import Process from "https://deno.land/std@0.103.0/node/process.ts";
import { BotHttpClient } from "./marxan-bot.ts";
import { logError, logInfo } from "./logger.ts";
import { tookMs } from "./util/perf.ts";

export class CostSurface {
  private httpClient;

  constructor(httpClient: BotHttpClient) {
    this.httpClient = httpClient;
  }

  async downloadTemplateShapefileForScenarioToFolder(
    scenarioId: string,
    destinationDirName: string,
  ): Promise<boolean> {
    const opStart = Process.hrtime();
    const success = await this.httpClient.get(
      `/api/v1/scenarios/${scenarioId}/cost-surface/shapefile-template`,
    )
      .then(this.byteArrayFromResponse)
      .then(async (shapefileData) => {
        const filePath =
          `${destinationDirName}/${scenarioId}_cost-surface-template.zip`;
        logInfo(`Writing shapefile template to file ${filePath}`);
        await this.writeDataToFile(filePath, shapefileData);
      })
      .then(() => true)
      .catch((e) => {
        logError(e.message);
        logError(e.stack);
        return false;
      });

    logInfo(
      `Cost surface template shapefile downloaded in ${
        tookMs(Process.hrtime(opStart))
      }ms.`,
    );
    return success;
  }

  private async byteArrayFromResponse(response: Response): Promise<Uint8Array> {
    const responseArrayBuffer = await response.blob().then(async (data) =>
      await data.arrayBuffer()
    );
    return new Uint8Array(responseArrayBuffer);
  }

  private async writeDataToFile(
    filePath: string,
    data: Uint8Array,
  ): Promise<void> {
    await Deno.writeFile(filePath, data);
  }
}
