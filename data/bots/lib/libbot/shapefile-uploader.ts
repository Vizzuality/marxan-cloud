import { BotHttpClient } from './marxan-bot.ts';

interface FileUpload {
  url: string,
  formField: string,
  data: Blob,
  fileName: string,
  headers: [string, string][],
}

export class ShapefileUploader {
  protected currentJwt;

  constructor(httpClient: BotHttpClient) {
    this.currentJwt = httpClient.currentJwt;
  }

  async sendData(config: FileUpload) {
    const formData = new FormData();
    formData.append(config.formField, config.data, config.fileName);
  
    const response = await fetch(config.url, {
      method: "POST",
      body: formData,
      headers: config.headers,
    });
  
    return response;
  }
}
