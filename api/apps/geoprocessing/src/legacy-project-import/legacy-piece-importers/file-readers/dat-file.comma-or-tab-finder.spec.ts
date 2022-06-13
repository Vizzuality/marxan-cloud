import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { isRight, isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import {
  DatFileCommaOrTab,
  DatFileCommaOrTabFinder,
} from './dat-file.comma-or-tab-finder';
import { invalidDelimiter } from './dat-file.delimiter-finder';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('fails when dat file uses invalid delimiter', async () => {
  const fileLocation = fixtures.GivenADatFileWithInvalidDelimiter();
  const result = await fixtures.WhenGettingDaDelimiter(fileLocation);
  fixtures.ThenDatFileFindDelimiterOperationFails(result);
});

it('succes when dat file uses comma delimiter', async () => {
  const fileLocation = fixtures.GivenAValidDatFileWithCommas();
  const result = await fixtures.WhenGettingDaDelimiter(fileLocation);
  fixtures.ThenDatDelimiterIsSuccessfullyFound(result, ',');
});

it('succes when dat file uses tab delimiter', async () => {
  const fileLocation = fixtures.GivenAValidDatFileWithTabs();
  const result = await fixtures.WhenGettingDaDelimiter(fileLocation);
  fixtures.ThenDatDelimiterIsSuccessfullyFound(result, '\t');
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [],
    providers: [DatFileCommaOrTabFinder],
  }).compile();
  await sandbox.init();

  const sut = sandbox.get(DatFileCommaOrTabFinder);
  const tabHeaders = 'id\tcost\tstatus\txloc\tyloc\n';
  const commaHeader = tabHeaders.replace(/\t/g, ',');
  const invalidDelimiterHeader = tabHeaders.replace(/\t/g, ' ');
  const amountOfRows = 100;

  return {
    GivenAValidDatFileWithCommas: () => {
      const rows = Array(amountOfRows)
        .fill('')
        .map((_, index) => `${index},${index * 10},0,${index},${index}`);

      return Readable.from(commaHeader + rows.join('\n'));
    },
    GivenAValidDatFileWithTabs: () => {
      const rows = Array(amountOfRows)
        .fill('')
        .map((_, index) => `${index}\t${index * 10}\t0\t${index}\t${index}`);

      return Readable.from(tabHeaders + rows.join('\n'));
    },
    GivenADatFileWithInvalidDelimiter: () => {
      const rows = Array(amountOfRows)
        .fill('')
        .map((_, index) => `${index} ${index * 10}\t0 ${index} ${index}`);

      return Readable.from(invalidDelimiterHeader + rows.join('\n'));
    },
    WhenGettingDaDelimiter: (file: Readable) => {
      return sut.findDelimiter(file);
    },
    ThenDatDelimiterIsSuccessfullyFound: (
      delimiter: DatFileCommaOrTab,
      expectedDelimiter: ',' | '\t',
    ) => {
      if (isLeft(delimiter)) throw new Error('Expected right result, got left');

      expect(delimiter.right).toEqual(expectedDelimiter);
    },
    ThenDatFileFindDelimiterOperationFails: (delimiter: DatFileCommaOrTab) => {
      if (isRight(delimiter))
        throw new Error('Expected left result, got right');

      expect(delimiter.left).toEqual(invalidDelimiter);
    },
  };
};
