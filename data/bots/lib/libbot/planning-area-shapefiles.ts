import { BotHttpClient } from './marxan-bot.ts';
import { ShapefileUploader } from './shapefile-uploader.ts';
import { logError } from './logger.ts';

interface FileUpload {
  url: string,
  formField: string,
  data: Blob,
  fileName: string,
  headers: [string, string][],
}

export class PlanningAreaShapefiles extends ShapefileUploader {
  private url;

  constructor(httpClient: BotHttpClient, urlPrefix: string) {
    super(httpClient);
    this.url = urlPrefix + '/api/v1/projects/planning-area/shapefile';
  }

  async uploadFromFile(localFilePath: string): Promise<string> {
    const data = new Blob([await Deno.readFile(localFilePath)])
    const planningAreaId: string = await (await this.sendData({
      url: this.url,
      formField: 'file',
      data,
      fileName: `${crypto.randomUUID}.zip`,
      headers: [['Authorization', `Bearer ${this.currentJwt}`]],
    }))
    .json()
    .then(data => data?.id)
    .catch(logError);

    return planningAreaId;
  }
}
