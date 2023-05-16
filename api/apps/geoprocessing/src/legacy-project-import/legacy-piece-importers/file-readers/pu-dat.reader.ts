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
  Available = 0,
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
  Available = 0,
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
      status: !isNil(status)
        ? (this.mapMarxanToInternalStatus(
            parseInt(status),
          ) as InternalPuLockStatus)
        : undefined,
      xloc: xloc ? parseFloat(xloc) : undefined,
      yloc: yloc ? parseFloat(yloc) : undefined,
    };
  }

  /**
   * Throwing an error when input status codes are unknown to the mapping we use
   * equates to kind of _validating_ input, so in practice once values reach the
   * relevant validation rule in the validateData() method above we will always
   * have valid status codes. However, as noted in DatFileReader.readFile(),
   * fast-csv always performs transformation first and validation next, so we
   * have no easy option other than validating while transforming here, since we
   * also need to pass through undefined input (source column may be empty), so
   * we need to signal failed mappings explicitly as we can't "just" use
   * undefined for this (which may arguably be an ok choice in a different
   * context when a map lookup leads to no results).
   */
  mapMarxanToInternalStatus(
    status: MarxanPuLockStatus,
  ): InternalPuLockStatus | undefined {
    // Don't attempt to look up value mappings if value is undefined: we need
    // to pass it through as is.
    if (isNil(status)) {
      return;
    }

    if (!isNil(marxanToInternalPuLockStatus[status])) {
      return marxanToInternalPuLockStatus[status];
    }
    throw new Error(`Invalid status value: ${status}.`);
  }
}
