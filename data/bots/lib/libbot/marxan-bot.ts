import axiod from "https://deno.land/x/axiod@0.23.2/mod.ts";
import { IAxiodResponse } from "https://deno.land/x/axiod@0.23.2/interfaces.ts";

export interface MarxanBotConfig {
  apiUrl: string;
  credentials: {
    username: string;
    password: string;
  };
}

const marxanBotBaseSettings = {
  baseUrl: "/api/v1",
};

export const getJsonApiDataFromResponse = (response: IAxiodResponse) => {
  return response?.data?.data;
};

export class BotHttpClient {
  constructor(config: MarxanBotConfig, jwt: string) {
    this.baseHttpClient = axiod.create({
      baseURL: config.apiUrl + marxanBotBaseSettings.baseUrl,
      headers: {
        Authorization: "Bearer " + jwt,
      },
    });

    this.currentJwt = jwt;
    this.baseUrl = config.apiUrl;
  }

  public baseHttpClient;
  public currentJwt;
  private baseUrl: string;

  get apiBaseUrl() {
    return this.baseUrl;
  }

  static async init(config: MarxanBotConfig) {
    const jwt = await axiod
      .post(`${config.apiUrl}/auth/sign-in/`, config.credentials)
      .then((result) => result.data.accessToken);

    return new BotHttpClient(config, jwt);
  }

  /**
   * GET via Fetch API
   *
   * Originally added to work around response encoding issues with axiod. In
   * general, this.baseHttpClient should be used instead of this method.
   */
  async get(url: string): Promise<Response> {
    return await fetch(`${this.baseUrl}${url}`, {
      headers: { Authorization: `Bearer ${this.currentJwt}` },
    });
  }
}
