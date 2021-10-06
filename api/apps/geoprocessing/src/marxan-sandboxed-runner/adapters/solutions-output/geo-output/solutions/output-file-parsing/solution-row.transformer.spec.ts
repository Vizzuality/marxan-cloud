import { fromPairs } from 'lodash';
import * as stream from 'stream';
import { SolutionTransformer } from './solution-row.transformer';

/**
 * marxan outputs unordered list
 * thus P18 may not be the very last one
 * in the case below, its at [1]
 */
const rows = [
  'SolutionsMatrix,P18,P7,P15,P8,P4,P2,P5,P17,P11,P16,P13,P9,P6,P1,P10,P3,P12,P14',
  'S1,0,1,0,1,1,1,1,0,0,1,0,1,1,1,0,1,1,0',
];

test(`assigns usage to relevant PU ID`, async () => {
  const sut = new SolutionTransformer(
    // keys: 1-18, values: "uuid-(1-18)"
    fromPairs(
      Array.from({ length: 18 }).map((_, i) => [i + 1, `uuid-${i + 1}`]),
    ),
  );

  const writableStream = new InMemoryWritable();
  const readableStream = new stream.Readable({
    objectMode: true,
  });
  rows.forEach((row) => readableStream.push(row));
  readableStream.push(null);
  readableStream.pipe(sut).pipe(writableStream);

  await new Promise((resolve) => writableStream.on('finish', resolve));

  expect(
    writableStream.data.find((solution) => solution.spdId === 'uuid-18'),
  ).toEqual({
    value: 0,
    runId: 1,
    puid: 18,
    spdId: `uuid-18`,
    raw: expect.any(String),
  });
  expect(
    writableStream.data.find((solution) => solution.spdId === 'uuid-17'),
  ).toEqual({
    value: 0,
    runId: 1,
    puid: 17,
    spdId: `uuid-17`,
    raw: expect.any(String),
  });
});

class InMemoryWritable extends stream.Writable {
  public readonly data: any[] = [];

  constructor() {
    super({
      objectMode: true,
    });
  }

  _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
    this.data.push(...chunk);
    callback();
  }
}
