import { HttpService, Injectable } from '@nestjs/common';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { IsOptional, IsString } from 'class-validator';
import { Readable } from 'stream';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Either, left, right } from 'fp-ts/lib/Either';
import { PDFOptions } from 'puppeteer';

export const unknownPdfWebshotError = Symbol(`unknown pdf webshot error`);

export class WebshotSummaryReportConfig {
  @ApiProperty()
  @IsString()
  baseUrl!: string;

  @ApiPropertyOptional()
  @IsOptional()
  cookie?: string;

  @ApiPropertyOptional()
  @IsOptional()
  pdfOptions?: PDFOptions;
}

@Injectable()
export class WebshotService {
  private webshotServiceUrl: string = AppConfig.get('webshot.url') as string;

  constructor(private readonly httpService: HttpService) {}

  async getSummaryReportForScenario(
    scenarioId: string,
    projectId: string,
    config: WebshotSummaryReportConfig,
  ): Promise<Either<typeof unknownPdfWebshotError, Readable>> {
    try {
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

      return right(stream);
    } catch (error) {
      return left(unknownPdfWebshotError);
    }
  }
}
