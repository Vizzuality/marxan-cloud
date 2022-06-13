import { Injectable } from '@nestjs/common';
import { right } from 'fp-ts/lib/Either';
import { Readable } from 'typeorm/platform/PlatformTools';
import {
  DatFileDelimiter,
  DatFileDelimiterFinder,
} from './dat-file.delimiter-finder';

@Injectable()
export class DatFileDelimiterFinderFake implements DatFileDelimiterFinder {
  public delimiterFound: DatFileDelimiter = right('\t');
  async findDelimiter(file: Readable): Promise<DatFileDelimiter> {
    return this.delimiterFound;
  }
}
