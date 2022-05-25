import { readableToBuffer } from '@marxan/utils';
import { Injectable } from '@nestjs/common';
import { Either, right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';

type PuDatRow = {
  id: number;
  cost?: number;
  status?: 0 | 1 | 2;
  xloc?: number;
  yloc?: number;
};

@Injectable()
export class PuDatReader {
  private validateHeader(header: string): Either<string, true> {
    return right(true);
  }

  async readPuDatFile(file: Readable): Promise<Either<string, PuDatRow[]>> {
    const buffer = await readableToBuffer(file);
    const [header, ...lines] = buffer.toString().split('\n');

    return right([]);
  }
}
