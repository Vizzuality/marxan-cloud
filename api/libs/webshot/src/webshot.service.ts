import { HttpService, Injectable } from '@nestjs/common';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { Readable } from 'stream';
import { Either, left, right } from 'fp-ts/lib/Either';
import { WebshotConfig } from './webshot.dto';

export const unknownPdfWebshotError = Symbol(`unknown pdf webshot error`);
export const unknownPngWebshotError = Symbol(`unknown png webshot error`);

@Injectable()
export class WebshotService {
  private webshotServiceUrl: string = AppConfig.get('webshot.url') as string;

  constructor(private readonly httpService: HttpService) {}

  async getSummaryReportForScenario(
    scenarioId: string,
    projectId: string,
    config: WebshotConfig,
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

  async getBlmValuesImage(
    scenarioId: string,
    projectId: string,
    config: WebshotConfig,
    blmValue: number,
  ): Promise<Either<typeof unknownPngWebshotError, Readable>> {
    try {
      const pngBuffer = await this.httpService
        .post(
          `${this.webshotServiceUrl}/projects/${projectId}/scenarios/${scenarioId}/calibration/maps/preview/${blmValue}`,
          config,
          { responseType: 'arraybuffer' },
        )
        .toPromise()
        .then((response) => response.data)
        .catch((error) => {
          throw new Error(error);
        });

      const stream = new Readable();

      stream.push(pngBuffer);
      stream.push(null);

      return right(stream);
    } catch (error) {
      return left(unknownPngWebshotError);
    }
  }
}