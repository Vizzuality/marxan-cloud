import { HttpService, Injectable, Logger } from '@nestjs/common';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { inspect } from 'util';

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
  pageUrl!: string;

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

  async getSummaryReportForProject(
    projectId: string,
    config: WebshotSummaryReportConfig,
  ) {
    return await this.httpService
      .post(`${this.webshotServiceUrl}/projects/${projectId}/summary-report`, config)
      .toPromise()
      .then(response => response.data);
  }
}
