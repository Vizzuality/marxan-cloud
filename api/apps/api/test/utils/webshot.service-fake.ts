import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { Either, left, right } from 'fp-ts/Either';
import {
  unknownPdfWebshotError,
  unknownPngWebshotError,
  WebshotPngConfig,
} from '@marxan/webshot';
import * as fs from 'fs';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class FakeWebshotService {
  constructor(private readonly httpService: HttpService) {}

  async getScenarioFrequencyComparisonMap() {
    try {
      const pdfBuffer = fs.readFileSync(__dirname + `/mock-file.pdf`);

      const stream = new Readable();

      stream.push(pdfBuffer);
      stream.push(null);

      return right(stream);
    } catch (error) {
      return left(unknownPdfWebshotError);
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
}
