import { MarxanInput, MarxanParameters } from '@marxan/marxan-input';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { isRight, isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import {
  InputDatReader,
  invalidInputDatFileVariables,
  ReadFileResult,
} from './input-dat.reader';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('reads successfully a valid input.dat file', async () => {
  const file = fixtures.GivenAValidInputDatFile();
  const result = await fixtures.WhenExecutingInputDatReader(file);
  fixtures.ThenInputDatRowsAreSuccessfullyRead(result);
});

it('fails when input.dat file contains invalid values for variables', async () => {
  const file = fixtures.GivenAnInvalidInputDatFile();
  const result = await fixtures.WhenExecutingInputDatReader(file);
  fixtures.ThenInputDatReadOperationFails(result);
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [],
    providers: [
      InputDatReader,
      { provide: MarxanInput, useClass: FakeMarxanInput },
    ],
  }).compile();
  await sandbox.init();

  const sut = sandbox.get(InputDatReader);
  const fakeMarxanInput: FakeMarxanInput = sandbox.get(MarxanInput);

  const inputDatVariables: MarxanParameters = { BLM: 1, BESTSCORE: 2 };
  const file = { ...inputDatVariables, RandomName: 2, blm: 4 };

  return {
    GivenAValidInputDatFile: () =>
      Readable.from(
        'Skip comments in input/n' +
          '.dat file/n' +
          Object.entries(file)
            .map(([key, value]) => `${key} ${value}`)
            .join('/n'),
      ),
    GivenAnInvalidInputDatFile: () => {
      fakeMarxanInput.failFromOperation = true;
      return Readable.from('');
    },
    WhenExecutingInputDatReader: (readable: Readable) => sut.readFile(readable),
    ThenInputDatRowsAreSuccessfullyRead: (output: ReadFileResult) => {
      if (isLeft(output)) throw new Error('Expected right result, got left');

      expect(output.right).toEqual(inputDatVariables);
    },
    ThenInputDatReadOperationFails: (output: ReadFileResult) => {
      if (isRight(output)) throw new Error('Expected left result, got right');

      expect(output.left).toEqual(invalidInputDatFileVariables);
    },
  };
};

class FakeMarxanInput {
  public failFromOperation = false;

  from(input: Partial<MarxanParameters>) {
    if (this.failFromOperation) throw new Error();
    return input;
  }
}
