import { HttpService, Injectable, Logger } from '@nestjs/common';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Readable } from 'stream';
export class WebshotViewport {
  @IsNumber()
  @Min(64)
  @Max(1920)
  width!: number;

  @IsNumber()
  @Min(64)
  @Max(1080)
  height!: number;
}

export class WebshotSummaryReportConfig {
  @IsString()
  baseUrl!: string;

  @IsOptional()
  viewport?: WebshotViewport;

  @IsOptional()
  cookie?: string;
}

@Injectable()
export class WebshotService {
  private webshotServiceUrl: string = AppConfig.get('webshot.url') as string;
  private readonly logger = new Logger(WebshotService.name);

  constructor(private httpService: HttpService) {}

  async getSummaryReportForScenario(
    projectId: string,
    scenarioId: string,
    config: WebshotSummaryReportConfig,
  ) {
    const pdfBuffer = await this.httpService
      .post(
        `${this.webshotServiceUrl}/projects/${projectId}/scenarios/${scenarioId}/solutions/report`,
        config,
        { responseType: 'arraybuffer' },
      )
      .toPromise()
      .then((response) => response.data)
      .catch((error) => {
        throw new Error(error);
      });

    const stream = new Readable();

    stream.push(pdfBuffer);
    stream.push(null);

    return stream;
  }
}
