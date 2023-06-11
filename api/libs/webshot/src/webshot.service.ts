import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Readable } from 'stream';
import { Either, left, right } from 'fp-ts/lib/Either';
import {
  WebshotBasicPdfConfig,
  WebshotPdfReportConfig,
  WebshotPngConfig,
} from './webshot.dto';
import { lastValueFrom } from 'rxjs';

export const unknownPdfWebshotError = Symbol(`unknown pdf webshot error`);
export const unknownPngWebshotError = Symbol(`unknown png webshot error`);

@Injectable()
export class WebshotService {
  constructor(private readonly httpService: HttpService) {}

  async getSummaryReportForScenario(
    scenarioId: string,
    projectId: string,
    config: WebshotPdfReportConfig,
    webshotUrl: string,
  ): Promise<Either<typeof unknownPdfWebshotError, Readable>> {
    try {
      const pdfBuffer = await lastValueFrom(
        this.httpService.post(
          `${webshotUrl}/projects/${projectId}/scenarios/${scenarioId}/solutions/report`,
          config,
          { responseType: 'arraybuffer' },
        ),
      )
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

  async getBlmValuesImage(
    scenarioId: string,
    projectId: string,
    config: WebshotPngConfig,
    blmValue: number,
    webshotUrl: string,
  ): Promise<Either<typeof unknownPngWebshotError, string>> {
    try {
      const pngBuffer = await lastValueFrom(
        this.httpService.post(
          `${webshotUrl}/projects/${projectId}/scenarios/${scenarioId}/calibration/maps/preview/${blmValue}`,
          config,
          { responseType: 'arraybuffer' },
        ),
      )
        .then((response) => response.data)
        .catch((error) => {
          throw new Error(error);
        });

      const pngBase64String = Buffer.from(pngBuffer).toString('base64');

      return right(pngBase64String);
    } catch (error) {
      return left(unknownPngWebshotError);
    }
  }

  async getPublishedProjectsImage(
    scenarioId: string,
    projectId: string,
    config: WebshotPngConfig,
    webshotUrl: string,
  ): Promise<Either<typeof unknownPngWebshotError, string>> {
    try {
      const pngBuffer = await lastValueFrom(
        this.httpService.post(
          `${webshotUrl}/projects/${projectId}/scenarios/${scenarioId}/published-projects/frequency`,
          config,
          { responseType: 'arraybuffer' },
        ),
      )
        .then((response) => response.data)
        .catch((error) => {
          throw new Error(error);
        });

      const pngBase64String = Buffer.from(pngBuffer).toString('base64');

      return right(pngBase64String);
    } catch (error) {
      return left(unknownPngWebshotError);
    }
  }
  async getScenarioFrequencyComparisonMap(
    scenarioIdA: string,
    scenarioIdB: string,
    projectId: string,
    config: WebshotBasicPdfConfig,
    webshotUrl: string,
  ) {
    try {
      const pdfBuffer = await lastValueFrom(
        // TODO - the endpoint is not yet implemented (will be part of new webshot handler)
        this.httpService.post(
          `${webshotUrl}/projects/${projectId}/scenarios/${scenarioIdA}/compare/${scenarioIdB}/comparison-map`,
          config,
          {
            responseType: 'arraybuffer',
          },
        ),
      )
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
