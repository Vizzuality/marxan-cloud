import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { Either, isRight, isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { PuvsprDatReader, PuvrsprDatRow } from './puvspr-dat.reader';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('reads successfully a valid puvspr.dat file', async () => {
  const file = fixtures.GivenAValidPusvprDatFile();
  const result = await fixtures.WhenExecutingPuvsprDatReader(file);
  fixtures.ThenPuvsprDatRowsAreSuccessfullyRead(result);
});

it('fails when puvspr.dat does not contain species ids', async () => {
  const file = fixtures.GivenPuvsprDatFileWithoutColumn('species');
  const result = await fixtures.WhenExecutingPuvsprDatReader(file);
  fixtures.ThenPuvsprDatReadOperationFails(
    result,
    /species id column is required/gi,
  );
});

it('fails when puvspr.dat does not contain pu id column', async () => {
  const file = fixtures.GivenPuvsprDatFileWithoutColumn('pu');
  const result = await fixtures.WhenExecutingPuvsprDatReader(file);
  fixtures.ThenPuvsprDatReadOperationFails(
    result,
    /pu id column is required/gi,
  );
});

it('fails when puvspr.dat does not contain amount', async () => {
  const file = fixtures.GivenPuvsprDatFileWithoutColumn('amount');
  const result = await fixtures.WhenExecutingPuvsprDatReader(file);
  fixtures.ThenPuvsprDatReadOperationFails(
    result,
    /amount column is required/gi,
  );
});

it('fails when puvspr.dat contains non integer species ids', async () => {
  const file = fixtures.GivenAnInvalidPuvsprDatFile({
    species: 'invalid species id',
  });
  const result = await fixtures.WhenExecutingPuvsprDatReader(file);
  fixtures.ThenPuvsprDatReadOperationFails(result, /non integer species id/gi);
});

it('fails when puvspr.dat contains negative species ids', async () => {
  const file = fixtures.GivenAnInvalidPuvsprDatFile({ species: -12 });
  const result = await fixtures.WhenExecutingPuvsprDatReader(file);
  fixtures.ThenPuvsprDatReadOperationFails(result, /negative species id/gi);
});

it('fails when puvspr.dat contains non integer pu values', async () => {
  const file = fixtures.GivenAnInvalidPuvsprDatFile({ pu: 'invalid pu' });
  const result = await fixtures.WhenExecutingPuvsprDatReader(file);
  fixtures.ThenPuvsprDatReadOperationFails(result, /non integer pu id/gi);
});

it('fails when puvspr.dat contains negative pu values', async () => {
  const file = fixtures.GivenAnInvalidPuvsprDatFile({ pu: -12 });
  const result = await fixtures.WhenExecutingPuvsprDatReader(file);
  fixtures.ThenPuvsprDatReadOperationFails(result, /negative pu id/gi);
});

it('fails when puvspr.dat contains non number amount values', async () => {
  const file = fixtures.GivenAnInvalidPuvsprDatFile({
    amount: 'invalid amount',
  });
  const result = await fixtures.WhenExecutingPuvsprDatReader(file);
  fixtures.ThenPuvsprDatReadOperationFails(result, /non number amount value/gi);
});

it('fails when puvspr.dat contains amount values greater than one', async () => {
  const file = fixtures.GivenAnInvalidPuvsprDatFile({ amount: 2 });
  const result = await fixtures.WhenExecutingPuvsprDatReader(file);
  fixtures.ThenPuvsprDatReadOperationFails(
    result,
    /amount values should between/gi,
  );
});

it('fails when puvspr.dat contains amount values lower than zero', async () => {
  const file = fixtures.GivenAnInvalidPuvsprDatFile({ amount: -1 });
  const result = await fixtures.WhenExecutingPuvsprDatReader(file);
  fixtures.ThenPuvsprDatReadOperationFails(
    result,
    /amount values should between/gi,
  );
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [],
    providers: [PuvsprDatReader],
  }).compile();
  await sandbox.init();

  const sut = sandbox.get(PuvsprDatReader);
  const headers = 'species\tpu\tamount\n';
  const amountOfRows = 100;

  const getValidRow = (index: number = 0) =>
    `${index}\t${index}\t${index / amountOfRows}`;

  return {
    GivenAValidPusvprDatFile: () => {
      const rows = Array(amountOfRows)
        .fill('')
        .map((_, index) => getValidRow(index));

      return Readable.from(headers + rows.join('\n'));
    },
    GivenAnInvalidPuvsprDatFile: ({
      species,
      pu,
      amount,
    }: {
      species?: any;
      pu?: any;
      amount?: any;
    }) => {
      const row = `${species ?? 0}\t${pu ?? 1}\t${amount ?? '0.3'}`;
      return Readable.from(headers + row);
    },
    GivenPuvsprDatFileWithoutColumn: (columnToRemove: string) => {
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
    WhenExecutingPuvsprDatReader: (
      readable: Readable,
    ): Promise<Either<string, PuvrsprDatRow[]>> => {
      return sut.readFile(readable);
    },
    ThenPuvsprDatRowsAreSuccessfullyRead: (
      output: Either<string, PuvrsprDatRow[]>,
    ) => {
      if (isLeft(output)) throw new Error('Expected right result, got left');

      expect(output.right).toHaveLength(amountOfRows);
    },
    ThenPuvsprDatReadOperationFails: (
      output: Either<string, PuvrsprDatRow[]>,
      expectedError: string | RegExp,
    ) => {
      if (isRight(output)) throw new Error('Expected left result, got right');

      expect(output.left).toMatch(expectedError);
    },
  };
};
