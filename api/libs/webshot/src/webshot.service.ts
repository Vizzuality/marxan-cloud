import { HttpService, Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { Either, left, right } from 'fp-ts/lib/Either';
import { WebshotPdfConfig, WebshotPngConfig } from './webshot.dto';

export const unknownPdfWebshotError = Symbol(`unknown pdf webshot error`);
export const unknownPngWebshotError = Symbol(`unknown png webshot error`);

@Injectable()
export class WebshotService {
  constructor(private readonly httpService: HttpService) {}

  async getSummaryReportForScenario(
    scenarioId: string,
    projectId: string,
    config: WebshotPdfConfig,
    webshotUrl: string,
  ): Promise<Either<typeof unknownPdfWebshotError, Readable>> {
    try {
      const pdfBuffer = await this.httpService
        .post(
          `${webshotUrl}/projects/${projectId}/scenarios/${scenarioId}/solutions/report`,
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
    config: WebshotPngConfig,
    blmValue: number,
    webshotUrl: string,
  ): Promise<Either<typeof unknownPngWebshotError, string>> {
    try {
      const pngBuffer = await this.httpService
        .post(
          `${webshotUrl}/projects/${projectId}/scenarios/${scenarioId}/calibration/maps/preview/${blmValue}`,
          config,
          { responseType: 'arraybuffer' },
        )
        .toPromise()
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
}
