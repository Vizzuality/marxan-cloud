import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/lib/Either';
import { DatFileReader, ValidationCheck } from './dat-file.reader';

type ReadRow = {
  species?: string;
  pu?: string;
  amount?: string;
};

export type PuvrsprDatRow = {
  species: number;
  pu: number;
  amount: number;
};

@Injectable()
export class PuvsprDatReader extends DatFileReader<ReadRow, PuvrsprDatRow> {
  validateData({ species, pu, amount }: PuvrsprDatRow): Either<string, true> {
    const isNumber = (value: unknown): value is number =>
      typeof value === 'number' && !Number.isNaN(value);
    const isInteger = (value: unknown) =>
      isNumber(value) && Number.isInteger(value);

    const checks: ValidationCheck[] = [
      {
        result: !isInteger(species),
        errorMessage: 'Invalid non integer species id',
      },
      {
        result: isInteger(species) && species < 0,
        errorMessage: 'Negative species id',
      },
      {
        result: !isInteger(pu),
        errorMessage: 'Invalid non integer pu id',
      },
      {
        result: isInteger(pu) && pu < 0,
        errorMessage: 'Negative pu id',
      },
      {
        result: !isNumber(amount),
        errorMessage: 'Non number amount value',
      },
      {
        result: isNumber(amount) && (amount < 0 || amount > 1),
        errorMessage: 'amount values should between [0, 1]',
      },
    ];

    const errors = checks
      .filter((check) => check.result)
      .map((check) => check.errorMessage);

    if (errors.length) return left(errors.join('. '));

    return right(true);
  }

  transform({ species, pu, amount }: ReadRow): PuvrsprDatRow {
    if (species === undefined) {
      throw new Error('species id column is required');
    }

    if (pu === undefined) {
      throw new Error('pu id column is required');
    }

    if (amount === undefined) {
      throw new Error('amount column is required');
    }

    return {
      species: parseInt(species),
      pu: parseInt(pu),
      amount: parseFloat(amount),
    };
  }
}
