import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/lib/Either';
import { DatFileReader, ValidationCheck } from './dat-file.reader';

type ReadRow = {
  id?: string;
  target?: string;
  prop?: string;
  spf?: string;
  target2?: string;
  targetocc?: string;
  name?: string;
  sepnum?: string;
  sepdistance?: string;
};

export type SpecDatRow = {
  id: number;
  prop: number;
  spf?: number;
  target2?: number;
  targetocc?: number;
  name: string;
  sepnum?: number;
  sepdistance?: number;
};

@Injectable()
export class SpecDatReader extends DatFileReader<ReadRow, SpecDatRow> {
  validateData({
    id,
    name,
    prop,
    spf,
    target2,
    targetocc,
    sepnum,
    sepdistance,
  }: SpecDatRow): Either<string, true> {
    const isNumber = (value: unknown): value is number =>
      typeof value === 'number' && !Number.isNaN(value);
    const isInteger = (value: unknown) =>
      isNumber(value) && Number.isInteger(value);

    const checks: ValidationCheck[] = [
      {
        result: name.length === 0,
        errorMessage: 'Invalid empty name',
      },
      {
        result: !isInteger(id),
        errorMessage: 'Invalid non integer feature id',
      },
      {
        result: isInteger(id) && id < 0,
        errorMessage: 'Negative feature id',
      },
      {
        result: !isNumber(prop),
        errorMessage: 'Non number prop value',
      },
      {
        result: isNumber(prop) && (prop < 0 || prop > 1),
        errorMessage: 'Prop values should between [0, 1]',
      },
      {
        result: !isNumber(spf),
        errorMessage: 'Non number spf value',
      },
      {
        result: isNumber(spf) && spf < 0,
        errorMessage: 'Negative spf value',
      },
      {
        result: !isNumber(target2),
        errorMessage: 'Non number target2 value',
      },
      {
        result: isNumber(target2) && target2 < 0,
        errorMessage: 'Negative target2 value',
      },
      {
        result: !isNumber(targetocc),
        errorMessage: 'Non number targetocc value',
      },
      {
        result: isNumber(targetocc) && targetocc < 0,
        errorMessage: 'Negative targetocc value',
      },
      {
        result: !isNumber(sepnum),
        errorMessage: 'Non number sepnum value',
      },
      {
        result: isNumber(sepnum) && sepnum < 0,
        errorMessage: 'Negative sepnum value',
      },
      {
        result: !isNumber(sepdistance),
        errorMessage: 'Non number sepdistance value',
      },
      {
        result: isNumber(sepdistance) && sepdistance < 0,
        errorMessage: 'Negative sepdistance value',
      },
    ];

    const errors = checks
      .filter((check) => check.result)
      .map((check) => check.errorMessage);

    if (errors.length) return left(errors.join('. '));

    return right(true);
  }

  transform({
    id,
    name,
    prop,
    sepdistance,
    sepnum,
    spf,
    target2,
    target,
    targetocc,
  }: ReadRow): SpecDatRow {
    if (id === undefined) {
      throw new Error('Id column is required');
    }

    if (name === undefined) {
      throw new Error('Name column is required');
    }

    if (prop === undefined) {
      throw new Error('Prop column is required');
    }

    if (target !== undefined) {
      throw new Error(`Target column is not supported, translate it to prop`);
    }

    return {
      id: parseInt(id),
      name,
      prop: parseFloat(prop),
      sepdistance: sepdistance ? parseFloat(sepdistance) : undefined,
      sepnum: sepnum ? parseFloat(sepnum) : undefined,
      spf: spf ? parseFloat(spf) : undefined,
      target2: target2 ? parseFloat(target2) : undefined,
      targetocc: targetocc ? parseFloat(targetocc) : undefined,
    };
  }
}
