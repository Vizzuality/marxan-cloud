import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/lib/Either';
import { createInterface } from 'readline';
import { Readable } from 'typeorm/platform/PlatformTools';
import {
  DatFileDelimiterFinder,
  invalidDelimiter,
} from './dat-file.delimiter-finder';

export type DatFileCommaOrTab = Either<typeof invalidDelimiter, ',' | '\t'>;

@Injectable()
export class DatFileCommaOrTabFinder implements DatFileDelimiterFinder {
  async findDelimiter(file: Readable): Promise<DatFileCommaOrTab> {
    const rl = createInterface({
      input: file,
    });

    const result = await new Promise<DatFileCommaOrTab>((resolve) => {
      rl.on(`line`, (line) => {
        const { tabDelimiter, commaDelimiter } = this.commaOrTabDelimiter(line);

        if (!tabDelimiter && !commaDelimiter) resolve(left(invalidDelimiter));

        resolve(right(tabDelimiter ? '\t' : ','));
      });
    });

    rl.close();
    return result;
  }

  private commaOrTabDelimiter = (line: string) => {
    const tabPattern = /[a-z\"\']\t[a-z\"\']+/;
    const commaPattern = /[a-z\"\'],[a-z\"\']+/;

    const tabDelimiter = tabPattern.test(line);
    const commaDelimiter = commaPattern.test(line);

    return { tabDelimiter, commaDelimiter };
  };
}
