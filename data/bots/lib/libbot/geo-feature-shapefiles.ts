import Process from "https://deno.land/std@0.103.0/node/process.ts";
import { BotHttpClient } from "./marxan-bot.ts";
import { FileUploader } from "./shapefile-uploader.ts";
import { logError, logInfo } from "./logger.ts";
import { tookMs } from "./util/perf.ts";

export interface GeoFeatureShapefile {
  metadata: GeoFeatureMetadata;
  localFilePath: string;
}

export enum FeatureTags {
  bioregional = "bioregional",
  species = "species",
}

export interface GeoFeatureMetadata {
  name: string;
  type: FeatureTags;
  description?: string;
  intersectWith?: string;
}

export class GeoFeatureShapefiles extends FileUploader {
  constructor(httpClient: BotHttpClient) {
    super(httpClient);
  }

  private async uploadFromFile(
    shapefile: GeoFeatureShapefile,
    projectId: string,
  ): Promise<string> {
    const opStart = Process.hrtime();
    const data = new Blob([await Deno.readFile(shapefile.localFilePath)]);
    const success = await (await this.sendData({
      url: `${this.baseUrl}/api/v1/projects/${projectId}/features/shapefile`,
      formField: "file",
      data,
      fileName: `${crypto.randomUUID()}.zip`,
      headers: [["Authorization", `Bearer ${this.currentJwt}`]],
      extraFields: [
        { key: "name", value: shapefile.metadata.name },
        { key: "type", value: shapefile.metadata.type },
        // @todo properly handle description when it is available
        // { key: 'description', value: shapefile.metadata.description },
      ],
    }))
      .json()
      .then((data) => data?.success ?? false)
      .catch(logError);

    logInfo(
      `Custom geofeature shapefile uploaded in ${
        tookMs(Process.hrtime(opStart))
      }ms.`,
    );
    return success;
  }

  async uploadForProject(
    projectId: string,
    localFilePath: string,
    metadata: GeoFeatureMetadata,
  ): Promise<string> {
    return await this.uploadFromFile({
      metadata,
      localFilePath,
    }, projectId);
  }
}
