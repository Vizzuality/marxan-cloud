import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { Either, isRight, isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { PuDatReader, PuDatRow } from './pu-dat.reader';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('reads successfully a valid pu.dat file', async () => {
  const file = fixtures.GivenAValidPuDatFile();
  const result = await fixtures.WhenExecutingPuDatReader(file);
  fixtures.ThenPuDatRowsAreSuccessfullyRead(result);
});

it('fails when pu.dat contains non integer puids', async () => {
  const file = fixtures.GivenAnInvalidPuDatFile({ id: 'invalid puid' });
  const result = await fixtures.WhenExecutingPuDatReader(file);
  fixtures.ThenPuDatReadOperationFails(result, /non integer puid/gi);
});

it('fails when pu.dat contains negative puids', async () => {
  const file = fixtures.GivenAnInvalidPuDatFile({ id: -12 });
  const result = await fixtures.WhenExecutingPuDatReader(file);
  fixtures.ThenPuDatReadOperationFails(result, /negative puid/gi);
});

it('fails when pu.dat contains non number cost', async () => {
  const file = fixtures.GivenAnInvalidPuDatFile({ cost: 'non number' });
  const result = await fixtures.WhenExecutingPuDatReader(file);
  fixtures.ThenPuDatReadOperationFails(result, /non number cost/gi);
});

it('fails when pu.dat contains negative cost', async () => {
  const file = fixtures.GivenAnInvalidPuDatFile({ cost: -12 });
  const result = await fixtures.WhenExecutingPuDatReader(file);
  fixtures.ThenPuDatReadOperationFails(result, /negative cost/gi);
});

it('fails when pu.dat contains invalid status values', async () => {
  const file = fixtures.GivenAnInvalidPuDatFile({ status: 5 });
  const result = await fixtures.WhenExecutingPuDatReader(file);
  fixtures.ThenPuDatReadOperationFails(result, /invalid status value/gi);
});

it('fails when pu.dat contains non number xloc', async () => {
  const file = fixtures.GivenAnInvalidPuDatFile({ xloc: 'str' });
  const result = await fixtures.WhenExecutingPuDatReader(file);
  fixtures.ThenPuDatReadOperationFails(result, /non number xloc/gi);
});

it('fails when pu.dat contains non number yloc', async () => {
  const file = fixtures.GivenAnInvalidPuDatFile({ yloc: 'str' });
  const result = await fixtures.WhenExecutingPuDatReader(file);
  fixtures.ThenPuDatReadOperationFails(result, /non number yloc/gi);
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [],
    providers: [PuDatReader],
  }).compile();
  await sandbox.init();

  const sut = sandbox.get(PuDatReader);
  const headers = 'id\tcost\tstatus\txloc\tyloc\n';
  const amountOfRows = 100;

  return {
    GivenAValidPuDatFile: () => {
      const rows = Array(amountOfRows)
        .fill('')
        .map((_, index) => `${index}\t${index * 10}\t0\t${index}\t${index}`);

      return Readable.from(headers + rows.join('\n'));
    },
    GivenAnInvalidPuDatFile: ({
      id,
      cost,
      status,
      xloc,
      yloc,
    }: {
      id?: any;
      cost?: any;
      status?: any;
      xloc?: any;
      yloc?: any;
    }) => {
      const row = `${id ?? '0'}\t${cost ?? 100}\t${status ?? 0}\t${
        xloc ?? 1
      }\t${yloc ?? 1}`;

      return Readable.from(headers + row);
    },
    WhenExecutingPuDatReader: (
      readable: Readable,
    ): Promise<Either<string, PuDatRow[]>> => {
      return sut.readFile(readable);
    },
    ThenPuDatRowsAreSuccessfullyRead: (output: Either<string, PuDatRow[]>) => {
      if (isLeft(output)) throw new Error('Expected right result, got left');

      expect(output.right).toHaveLength(amountOfRows);
    },
    ThenPuDatReadOperationFails: (
      output: Either<string, PuDatRow[]>,
      expectedError: string | RegExp,
    ) => {
      if (isRight(output)) throw new Error('Expected left result, got right');

      expect(output.left).toMatch(expectedError);
    },
  };
};
