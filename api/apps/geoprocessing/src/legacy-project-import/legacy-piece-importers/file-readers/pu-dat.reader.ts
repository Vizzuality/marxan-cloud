import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/lib/Either';
import { isNil } from 'lodash';
import { DatFileReader, ValidationCheck } from './dat-file.reader';

type ReadRow = {
  id?: string;
  cost?: string;
  status?: '0' | '1' | '2' | '3';
  xloc?: string;
  yloc?: string;
};

enum MarxanPuLockStatus {
  Unstated = 0,
  InSeed = 1,
  LockedIn = 2,
  LockedOut = 3,
}

const marxanToInternalPuLockStatus = {
  0: 0,
  1: 0,
  2: 1,
  3: 2,
};

enum InternalPuLockStatus {
  Unstated = 0,
  LockedIn = 1,
  LockedOut = 2,
}

export type PuDatRow = {
  id: number;
  cost?: number;
  status?: InternalPuLockStatus;
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
        result: Number.isInteger(id) && id < 0,
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
        result: status !== undefined && ![0, 1, 2, 3].includes(status),
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
      status: !isNil(status) ? (this.mapMarxanToInternalStatus(parseInt(status)) as InternalPuLockStatus) : undefined,
      xloc: xloc ? parseFloat(xloc) : undefined,
      yloc: yloc ? parseFloat(yloc) : undefined,
    };
  }

  mapMarxanToInternalStatus(status: MarxanPuLockStatus): InternalPuLockStatus | undefined {
    // Don't attempt to look up value mappings if value is undefined: we need
    // to pass it through as is.
    if(isNil(status)) {
      return;
    }

    if(!isNil(marxanToInternalPuLockStatus[status])) {
      return marxanToInternalPuLockStatus[status];
    }
    throw new Error(`Invalid status value: ${status}.`);
  }
}
