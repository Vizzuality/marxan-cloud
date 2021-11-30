import { BotHttpClient } from "./marxan-bot.ts";

interface FileUpload {
  url: string;
  formField: string;
  data: Blob;
  fileName: string;
  headers: [string, string][];
  extraFields?: { key: string; value: string }[];
}

export class FileUploader {
  protected currentJwt: string;
  protected baseUrl: string;

  constructor(httpClient: BotHttpClient) {
    this.currentJwt = httpClient.currentJwt;
    this.baseUrl = httpClient.apiBaseUrl;
  }

  async sendData(config: FileUpload) {
    const formData = new FormData();
    formData.append(config.formField, config.data, config.fileName);

    config.extraFields?.forEach((extraField) => {
      formData.append(extraField.key, extraField.value);
    });

    const response = await fetch(config.url, {
      method: "POST",
      body: formData,
      headers: config.headers,
    });

    return response;
  }
}
