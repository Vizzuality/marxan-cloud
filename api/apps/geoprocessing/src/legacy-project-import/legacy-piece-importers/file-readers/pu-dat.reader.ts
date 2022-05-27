import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/lib/Either';
import { DatFileReader, ValidationCheck } from './dat-file.reader';

type ReadRow = {
  id?: string;
  cost?: string;
  status?: '0' | '1' | '2';
  xloc?: string;
  yloc?: string;
};

export type PuDatRow = {
  id: number;
  cost?: number;
  status?: 0 | 1 | 2;
  xloc?: number;
  yloc?: number;
};

@Injectable()
export class PuDatReader extends DatFileReader<ReadRow, PuDatRow> {
  validateData({
    id,
    cost,
    status,
    xloc,
    yloc,
  }: PuDatRow): Either<string, true> {
    const checks: ValidationCheck[] = [
      {
        result: !Number.isInteger(id),
        errorMessage: 'Invalid non integer puid',
      },
      {
        result: id < 0,
        errorMessage: 'Negative puid',
      },
      {
        result:
          cost !== undefined &&
          (typeof cost !== 'number' || Number.isNaN(cost)),
        errorMessage: 'Invalid non number cost',
      },
      {
        result: cost !== undefined && cost < 0,
        errorMessage: 'Negative cost',
      },
      {
        result: status !== undefined && ![0, 1, 2].includes(status),
        errorMessage: `Invalid status value: ${status}`,
      },
      {
        result:
          xloc !== undefined &&
          (typeof xloc !== 'number' || Number.isNaN(xloc)),
        errorMessage: 'Invalid non number xloc',
      },
      {
        result:
          yloc !== undefined &&
          (typeof yloc !== 'number' || Number.isNaN(yloc)),
        errorMessage: 'Invalid non number yloc',
      },
    ];

    const errors = checks
      .filter((check) => check.result)
      .map((check) => check.errorMessage);

    if (errors.length) return left(errors.join('. '));

    return right(true);
  }

  transform({ id, cost, status, xloc, yloc }: ReadRow): PuDatRow {
    if (id === undefined) {
      throw new Error('Id column not found');
    }

    return {
      id: parseInt(id),
      cost: cost ? parseFloat(cost) : undefined,
      status: status ? (parseInt(status) as 0 | 1 | 2) : undefined,
      xloc: xloc ? parseFloat(xloc) : undefined,
      yloc: yloc ? parseFloat(yloc) : undefined,
    };
  }
}
