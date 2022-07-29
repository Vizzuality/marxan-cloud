import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { Either, isRight, isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { SpecDatReader, SpecDatRow } from './spec-dat.reader';

let fixtures: FixtureType<typeof getFixtures>;

const generateRandomStrictlyNegativeNumber = () => (-1 * (1 - Math.random()));

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('reads successfully a valid spec.dat file', async () => {
  const file = fixtures.GivenAValidSpecDatFile();
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatRowsAreSuccessfullyRead(result);
});

it('gives default names to unnamed features', async () => {
  const file = fixtures.GivenSpecDatFileWithoutNameColumn();
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenFeaturesShouldHaveDefaultNames(result);
});

it('fails when spec.dat does not contain ids', async () => {
  const file = fixtures.GivenSpecDatFileWithoutIdColumn();
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(result, /id column is required/gi);
});

it('fails when spec.dat does not contain prop nor target', async () => {
  const file = fixtures.GivenSpecDatFileWithoutPropAndTargetColumn();
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(
    result,
    /prop and target column should be exclusively defined/gi,
  );
});

it('fails when spec.dat contains prop and target', async () => {
  const file = fixtures.GivenSpecDatFileWithPropAndTargetColumn();
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(
    result,
    /prop and target column should be exclusively defined/gi,
  );
});

it('fails when spec.dat contains non integer feature ids', async () => {
  const file = fixtures.GivenAnInvalidSpecDatFile({ id: 'invalid id' });
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(result, /non integer feature id/gi);
});

it('fails when spec.dat contains negative feature ids', async () => {
  const file = fixtures.GivenAnInvalidSpecDatFile({ id: -12 });
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(result, /negative feature id/gi);
});

it('fails when spec.dat contains non integer feature target values', async () => {
  const file = fixtures.GivenAnInvalidSpecDatFile({ target: 'foo' }, false);
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(result, /non integer target value/gi);
});

it('fails when spec.dat contains negative target values', async () => {
  const file = fixtures.GivenAnInvalidSpecDatFile({ target: -12 }, false);
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(result, /negative target value/gi);
});

it('fails when spec.dat contains non number prop values', async () => {
  const file = fixtures.GivenAnInvalidSpecDatFile({ prop: 'invalid prop' });
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(result, /non number prop value/gi);
});

it('fails when spec.dat contains prop values greater than one', async () => {
  const file = fixtures.GivenAnInvalidSpecDatFile({ prop: 2 });
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(
    result,
    /prop values should between/gi,
  );
});

it('fails when spec.dat contains prop values lower than zero', async () => {
  const file = fixtures.GivenAnInvalidSpecDatFile({ prop: -1 });
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(
    result,
    /prop values should between/gi,
  );
});

it('fails when spec.dat contains prop values lower than zero', async () => {
  const file = fixtures.GivenAnInvalidSpecDatFile({ prop: generateRandomStrictlyNegativeNumber() });
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(
    result,
    /prop values should between/gi,
  );
});

it('fails when spec.dat contains non integer spf values', async () => {
  const file = fixtures.GivenAnInvalidSpecDatFile({ spf: 'invalid spf' });
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(result, /non number spf value/gi);
});

it('fails when spec.dat contains negative spf values', async () => {
  const file = fixtures.GivenAnInvalidSpecDatFile({ spf: -12 });
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(result, /negative spf value/gi);
});

it('fails when spec.dat contains non integer target2 values', async () => {
  const file = fixtures.GivenAnInvalidSpecDatFile({
    target2: 'invalid target2',
  });
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(result, /non number target2 value/gi);
});

it('fails when spec.dat contains negative target2 values', async () => {
  const file = fixtures.GivenAnInvalidSpecDatFile({ target2: -12 });
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(result, /negative target2 value/gi);
});

it('fails when spec.dat contains non integer targetocc values', async () => {
  const file = fixtures.GivenAnInvalidSpecDatFile({
    targetocc: 'invalid targetocc',
  });
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(
    result,
    /non number targetocc value/gi,
  );
});

it('fails when spec.dat contains negative targetocc values', async () => {
  const file = fixtures.GivenAnInvalidSpecDatFile({ targetocc: -12 });
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(result, /negative targetocc value/gi);
});

it('fails when spec.dat contains non integer sepnum values', async () => {
  const file = fixtures.GivenAnInvalidSpecDatFile({ sepnum: 'invalid sepnum' });
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(result, /non number sepnum value/gi);
});

it('fails when spec.dat contains negative sepnum values', async () => {
  const file = fixtures.GivenAnInvalidSpecDatFile({ sepnum: -12 });
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(result, /negative sepnum value/gi);
});

it('fails when spec.dat contains non integer sepdistance values', async () => {
  const file = fixtures.GivenAnInvalidSpecDatFile({
    sepdistance: 'invalid sepdistance',
  });
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(
    result,
    /non number sepdistance value/gi,
  );
});

it('fails when spec.dat contains negative sepdistance values', async () => {
  const file = fixtures.GivenAnInvalidSpecDatFile({ sepdistance: -12 });
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(
    result,
    /negative sepdistance value/gi,
  );
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [],
    providers: [SpecDatReader],
  }).compile();
  await sandbox.init();

  const sut = sandbox.get(SpecDatReader);
  const headers =
    'id\tprop\tspf\ttarget2\ttargetocc\tname\tsepnum\tsepdistance\n';
  const amountOfRows = 100;

  const getValidRow = (index: number = 0) =>
    `${index}\t${(index + 1) / amountOfRows}\t${
      index / 10
    }\t${index}\t${index}\t${index}\t${index * 2}\t${index + 4}`;

  return {
    GivenAValidSpecDatFile: () => {
      const rows = Array(amountOfRows)
        .fill('')
        .map((_, index) => getValidRow(index));

      return Readable.from(headers + rows.join('\n'));
    },
    GivenAnInvalidSpecDatFile: (
      {
        id,
        prop,
        target,
        spf,
        target2,
        targetocc,
        name,
        sepnum,
        sepdistance,
      }: {
        id?: any;
        prop?: any;
        target?: any;
        spf?: any;
        target2?: any;
        targetocc?: any;
        name?: any;
        sepnum?: any;
        sepdistance?: any;
      },
      propColumn = true,
    ) => {
      const headers = `id\t${
        propColumn ? 'prop' : 'target'
      }\tspf\ttarget2\ttargetocc\tname\tsepnum\tsepdistance\n`;
      const row = `${id ?? 0}\t${
        propColumn ? prop ?? '0.3' : target ?? '200'
      }\t${spf ?? 1}\t${target2 ?? 1}\t${targetocc ?? 1}\t${name ?? 'name'}\t${
        sepnum ?? 1
      }\t${sepdistance ?? 1}`;

      return Readable.from(headers + row);
    },
    GivenSpecDatFileWithoutIdColumn: () => {
      const headers =
        'prop\tspf\ttarget2\ttargetocc\tname\tsepnum\tsepdistance\n';
      const row = `0.3\t1\t100\t10000\tname\t1\t1`;

      return Readable.from(headers + row);
    },
    GivenSpecDatFileWithoutNameColumn: () => {
      const headers =
        'id\tprop\tspf\ttarget2\ttargetocc\tsepnum\tsepdistance\n';
      const row = `1\t0.3\t1\t100\t10000\t1\t1`;

      return Readable.from(headers + row);
    },
    GivenSpecDatFileWithoutPropAndTargetColumn: () => {
      const headers =
        'id\tname\tspf\ttarget2\ttargetocc\tsepnum\tsepdistance\n';
      const row = `1\tname\t1\t100\t10000\t1\t1`;

      return Readable.from(headers + row);
    },
    GivenSpecDatFileWithPropAndTargetColumn: () => {
      const headers =
        'id\tname\tprop\ttarget\tspf\ttarget2\ttargetocc\tsepnum\tsepdistance\n';
      const row = `1\tname\t0.1\t100\t1\t100\t10000\t1\t1`;

      return Readable.from(headers + row);
    },
    WhenExecutingSpecDatReader: (
      readable: Readable,
    ): Promise<Either<string, SpecDatRow[]>> => {
      return sut.readFile(readable);
    },
    ThenSpecDatRowsAreSuccessfullyRead: (
      output: Either<string, SpecDatRow[]>,
    ) => {
      if (isLeft(output)) throw new Error('Expected right result, got left');

      expect(output.right).toHaveLength(amountOfRows);
    },
    ThenFeaturesShouldHaveDefaultNames: (
      output: Either<string, SpecDatRow[]>,
    ) => {
      if (isLeft(output)) throw new Error('Expected right result, got left');

      const [first] = output.right;

      expect(first.name).toEqual('Unnamed feature 1');
    },
    ThenSpecDatReadOperationFails: (
      output: Either<string, SpecDatRow[]>,
      expectedError: string | RegExp,
    ) => {
      if (isRight(output)) throw new Error('Expected left result, got right');

      expect(output.left).toMatch(expectedError);
    },
  };
};
