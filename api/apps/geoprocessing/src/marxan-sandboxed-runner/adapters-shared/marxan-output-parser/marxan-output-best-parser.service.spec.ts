import { Test } from '@nestjs/testing';
import { v4 } from 'uuid';
import { MarxanOutputBestParserService } from './marxan-output-best-parser.service';

let sut: MarxanOutputBestParserService;
const randomUuid = v4();

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [MarxanOutputBestParserService],
  }).compile();

  sut = sandbox.get(MarxanOutputBestParserService);
});

describe(`given empty content`, () => {
  it(`should return empty array`, async () => {
    expect(sut.parse('')).toEqual([]);
  });
});

describe(`given headers only`, () => {
  it(`should return empty array`, async () => {
    expect(sut.parse('one,two,three')).toEqual([]);
  });
});

describe(`given invalid data in a row (non integer id)`, () => {
  it(`should throw an error`, async () => {
    expect(() =>
      sut.parse(
        `headers...
${randomUuid},1`,
      ),
    ).toThrow(
      new Error(
        `Unexpected values in Marxan output at value [0]: [${randomUuid},1]`,
      ),
    );
  });
});

describe(`given data`, () => {
  it(`should return parsed values`, async () => {
    expect(sut.parse(content)).toMatchInlineSnapshot(`
      Array [
        OutputBestParsedRow {
          "puid": 1,
          "solution": 0,
        },
        OutputBestParsedRow {
          "puid": 2,
          "solution": 0,
        },
        OutputBestParsedRow {
          "puid": 3,
          "solution": 1,
        },
        OutputBestParsedRow {
          "puid": 4,
          "solution": 1,
        },
        OutputBestParsedRow {
          "puid": 5,
          "solution": 0,
        },
      ]
    `);
  });
});

const content = `"PUID", "SOLUTION"
1,0
2,0
3,1
4,1
5,0
`;
