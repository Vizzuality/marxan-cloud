import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { left, right } from 'fp-ts/Either';
import { unknownPdfWebshotError } from '@marxan/webshot';
import * as fs from 'fs';

@Injectable()
export class FakeWebshotService {
  constructor() {}

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
}
