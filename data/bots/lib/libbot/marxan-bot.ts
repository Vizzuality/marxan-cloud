import axiod from "https://deno.land/x/axiod@0.22/mod.ts";

interface MarxanBotConfig {
  apiUrl: string,
  credentials: {
    username: string,
    password: string,
  }
}

interface FileUpload {
  url: string,
  formField: string,
  data: Blob,
  fileName: string,
  headers: [string, string][],
}

const marxanBotBaseSettings = {
  baseUrl: '/api/v1',
}

export class BotHttpClient {
  constructor(config: MarxanBotConfig, jwt: string) {
    this.baseHttpClient = axiod.create({
      baseURL: config.apiUrl + marxanBotBaseSettings.baseUrl,
      headers: {
        Authorization: "Bearer " + jwt,
      },
    });
  }

  public baseHttpClient;

  static async init(config: MarxanBotConfig) {
    const jwt = await axiod
      .post(`${config.apiUrl}/auth/sign-in/`, config.credentials)
      .then((result) => result.data.accessToken);

    return new BotHttpClient(config, jwt);
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
