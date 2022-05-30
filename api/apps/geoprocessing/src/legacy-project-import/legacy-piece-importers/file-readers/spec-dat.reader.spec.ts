import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { Either, isRight, isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { SpecDatReader, SpecDatRow } from './spec-dat.reader';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('reads successfully a valid spec.dat file', async () => {
  const file = fixtures.GivenAValidSpecDatFile();
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatRowsAreSuccessfullyRead(result);
});

it('fails when spec.dat does not contain ids', async () => {
  const file = fixtures.GivenSpecDatFileWithoutColumn('id');
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(result, /id column is required/gi);
});

it('fails when spec.dat does not contain name column', async () => {
  const file = fixtures.GivenSpecDatFileWithoutColumn('name');
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(result, /name column is required/gi);
});

it('fails when spec.dat does not contain prop', async () => {
  const file = fixtures.GivenSpecDatFileWithoutColumn('prop');
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(result, /prop column is required/gi);
});

it('fails when spec.dat contains target colum', async () => {
  const file = fixtures.GivenSpecDatFileWithTargetColumn();
  const result = await fixtures.WhenExecutingSpecDatReader(file);
  fixtures.ThenSpecDatReadOperationFails(
    result,
    /target column is not supported/gi,
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
    `${index}\t${index / amountOfRows}\t${
      index / 10
    }\t${index}\t${index}\t${index}\t${index * 2}\t${index + 4}`;

  return {
    GivenAValidSpecDatFile: () => {
      const rows = Array(amountOfRows)
        .fill('')
        .map((_, index) => getValidRow(index));

      return Readable.from(headers + rows.join('\n'));
    },
    GivenAnInvalidSpecDatFile: ({
      id,
      prop,
      spf,
      target2,
      targetocc,
      name,
      sepnum,
      sepdistance,
    }: {
      id?: any;
      prop?: any;
      spf?: any;
      target2?: any;
      targetocc?: any;
      name?: any;
      sepnum?: any;
      sepdistance?: any;
    }) => {
      const headers =
        'id\tprop\tspf\ttarget2\ttargetocc\tname\tsepnum\tsepdistance\n';
      const row = `${id ?? 0}\t${prop ?? '0.3'}\t${spf ?? 1}\t${
        target2 ?? 1
      }\t${targetocc ?? 1}\t${name ?? 'name'}\t${sepnum ?? 1}\t${
        sepdistance ?? 1
      }`;

      return Readable.from(headers + row);
    },
    GivenSpecDatFileWithoutColumn: (columnToRemove: string) => {
      let columnToRemoveIndex = -1;
      const wrongHeaders =
        headers
          .replace('\n', '')
          .split('\t')
          .filter((column, index) => {
            if (column === columnToRemove) {
              columnToRemoveIndex = index;
              return false;
            }
            return true;
          })
          .join('\t') + '\n';

      let row = getValidRow().split('\t');
      if (columnToRemoveIndex !== -1) row.splice(columnToRemoveIndex, 1);

      return Readable.from(wrongHeaders + row.join('\t'));
    },
    GivenSpecDatFileWithTargetColumn: () => {
      const wrongHeaders = headers.replace('\n', '') + '\ttarget\n';
      const row = getValidRow() + '\t10000';

      return Readable.from(wrongHeaders + row);
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
    ThenSpecDatReadOperationFails: (
      output: Either<string, SpecDatRow[]>,
      expectedError: string | RegExp,
    ) => {
      if (isRight(output)) throw new Error('Expected left result, got right');

      expect(output.left).toMatch(expectedError);
    },
  };
};
