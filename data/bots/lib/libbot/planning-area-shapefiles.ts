import Process from "https://deno.land/std@0.103.0/node/process.ts";
import { BotHttpClient } from "./marxan-bot.ts";
import { ShapefileUploader } from "./shapefile-uploader.ts";
import { logDebug, logError, logInfo } from "./logger.ts";
import { tookMs } from "./util/perf.ts";

interface FileUpload {
  url: string;
  formField: string;
  data: Blob;
  fileName: string;
  headers: [string, string][];
}

export class PlanningAreaShapefiles extends ShapefileUploader {
  private url;

  constructor(httpClient: BotHttpClient, urlPrefix: string) {
    super(httpClient);
    this.url = urlPrefix + "/api/v1/projects/planning-area/shapefile";
  }

  async uploadFromFile(localFilePath: string): Promise<string> {
    const opStart = Process.hrtime();

    const data = new Blob([await Deno.readFile(localFilePath)]);
    const planningAreaId: string = await (await this.sendData({
      url: this.url,
      formField: "file",
      data,
      fileName: `${crypto.randomUUID()}.zip`,
      headers: [["Authorization", `Bearer ${this.currentJwt}`]],
    }))
      .json()
      .then((data) => data?.id)
      .catch(logError);

    logInfo(
      `Custom planning ares shapefile uploaded in ${
        tookMs(Process.hrtime(opStart))
      }ms.`,
    );
    logDebug(`Planning area id: ${planningAreaId}`);
    return planningAreaId;
  }
}
