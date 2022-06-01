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

type CommonColumns = {
  id: number;
  spf?: number;
  target2?: number;
  targetocc?: number;
  name: string;
  sepnum?: number;
  sepdistance?: number;
};

export type PropSpecDatRow = CommonColumns & {
  prop: number;
};

export type TargetSpecDatRow = CommonColumns & {
  target: number;
};

export type SpecDatRow = PropSpecDatRow | TargetSpecDatRow;

type Prop = { prop: number };
type Target = { target: number };
type PropOrTarget = Prop | Target;

@Injectable()
export class SpecDatReader extends DatFileReader<ReadRow, SpecDatRow> {
  isPropRow(row: PropOrTarget): row is Prop {
    return (row as Prop).prop !== undefined;
  }

  isTargetRow(row: PropOrTarget): row is Target {
    return (row as Target).target !== undefined;
  }

  validateData({
    id,
    name,
    spf,
    target2,
    targetocc,
    sepnum,
    sepdistance,
    ...propOrTarget
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
        result: this.isPropRow(propOrTarget) && !isNumber(propOrTarget.prop),
        errorMessage: 'Non number prop value',
      },
      {
        result:
          this.isPropRow(propOrTarget) &&
          isNumber(propOrTarget.prop) &&
          (propOrTarget.prop < 0 || propOrTarget.prop > 1),
        errorMessage: 'Prop values should between [0, 1]',
      },
      {
        result:
          this.isTargetRow(propOrTarget) && !isInteger(propOrTarget.target),
        errorMessage: 'Non integer target value',
      },
      {
        result:
          this.isTargetRow(propOrTarget) &&
          isInteger(propOrTarget.target) &&
          propOrTarget.target < 0,
        errorMessage: 'Negative target value',
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
    sepdistance,
    sepnum,
    spf,
    target2,
    targetocc,
    prop,
    target,
  }: ReadRow): SpecDatRow {
    if (id === undefined) {
      throw new Error('Id column is required');
    }

    if (name === undefined) {
      throw new Error('Name column is required');
    }

    const propAndTargetUndefined = prop === undefined && target === undefined;
    const propAndTargetDefined = prop !== undefined && target !== undefined;

    if (propAndTargetUndefined || propAndTargetDefined) {
      throw new Error('Prop and target column should be exclusively defined');
    }

    const values = {
      id: parseInt(id),
      name,
      sepdistance: sepdistance ? parseFloat(sepdistance) : undefined,
      sepnum: sepnum ? parseFloat(sepnum) : undefined,
      spf: spf ? parseFloat(spf) : undefined,
      target2: target2 ? parseFloat(target2) : undefined,
      targetocc: targetocc ? parseFloat(targetocc) : undefined,
    };

    if (target !== undefined) {
      return {
        ...values,
        target: parseInt(target),
      };
    }

    if (prop !== undefined) {
      return {
        ...values,
        prop: parseFloat(prop),
      };
    }

    throw new Error('Unreachable code');
  }
}
