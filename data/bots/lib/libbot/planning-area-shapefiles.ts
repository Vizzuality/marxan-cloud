import Process from "https://deno.land/std@0.103.0/node/process.ts";
import { BotHttpClient } from "./marxan-bot.ts";
import { FileUploader } from "./shapefile-uploader.ts";
import { logDebug, logError, logInfo } from "./logger.ts";
import { tookMs } from "./util/perf.ts";

enum PlanningAreaShapefileKind {
  planningArea = "planningArea",
  planningGrid = "planningGrid",
}

interface PlanningAreaShapefile {
  kind: PlanningAreaShapefileKind;
  localFilePath: string;
}

export class PlanningAreas extends FileUploader {
  constructor(httpClient: BotHttpClient) {
    super(httpClient);
  }

  private getUrl(kind: PlanningAreaShapefileKind): string {
    if (kind === PlanningAreaShapefileKind.planningArea) {
      return `${this.baseUrl}/api/v1/projects/planning-area/shapefile`;
    }
    if (kind === PlanningAreaShapefileKind.planningGrid) {
      return `${this.baseUrl}/api/v1/projects/planning-area/shapefile-grid`;
    }
    throw new Error(`Unknown planning area shapefile kind: ${kind}`);
  }

  private async uploadFromFile(
    shapefile: PlanningAreaShapefile,
  ): Promise<string> {
    const opStart = Process.hrtime();

    const data = new Blob([await Deno.readFile(shapefile.localFilePath)]);
    const planningAreaId: string = await (await this.sendData({
      url: this.getUrl(shapefile.kind),
      formField: "file",
      data,
      fileName: `${crypto.randomUUID()}.zip`,
      headers: [["Authorization", `Bearer ${this.currentJwt}`]],
    }))
      .json()
      .then((data) => data?.id)
      .catch(logError);

    logInfo(
      `Custom ${shapefile.kind} shapefile uploaded in ${
        tookMs(Process.hrtime(opStart))
      }ms.`,
    );
    logDebug(`Planning area id: ${planningAreaId}`);
    return planningAreaId;
  }

  async setFromShapefile(localFilePath: string): Promise<string> {
    return this.uploadFromFile({
      kind: PlanningAreaShapefileKind.planningArea,
      localFilePath,
    });
  }

  async setFromGridShapefile(localFilePath: string): Promise<string> {
    return this.uploadFromFile({
      kind: PlanningAreaShapefileKind.planningGrid,
      localFilePath,
    });
  }
}
