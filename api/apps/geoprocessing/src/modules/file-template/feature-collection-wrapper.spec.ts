import * as stream from 'stream';
import { FeatureCollectionWrapper } from './feature-collection-wrapper';

describe(`while piping zero features`, () => {
  let writableStream: stream.Writable & { data: any[] };
  beforeEach(async () => {
    // given
    const readableStream = new stream.Readable({
      objectMode: true,
    });
    readableStream.push(null);
    writableStream = new InMemoryWritable();

    // when
    readableStream.pipe(new FeatureCollectionWrapper()).pipe(writableStream);

    await new Promise((resolve) => writableStream.on('finish', resolve));
  });

  it(`should return parsable empty collection`, () => {
    expect(JSON.parse(writableStream.data.join(''))).toStrictEqual({
      features: [],
      type: 'FeatureCollection',
    });
  });
});

describe(`while piping one feature`, () => {
  let writableStream: stream.Writable & { data: any[] };
  beforeEach(async () => {
    // given
    const readableStream = new stream.Readable({
      objectMode: true,
    });
    readableStream.push({ single: 'feature' });
    readableStream.push(null);
    writableStream = new InMemoryWritable();

    // when
    readableStream.pipe(new FeatureCollectionWrapper()).pipe(writableStream);

    await new Promise((resolve) => writableStream.on('finish', resolve));
  });

  it(`should return parsable empty collection`, () => {
    expect(JSON.parse(writableStream.data.join(''))).toStrictEqual({
      features: [{ single: 'feature' }],
      type: 'FeatureCollection',
    });
  });
});

describe(`while piping three features`, () => {
  let writableStream: stream.Writable & { data: any[] };
  beforeEach(async () => {
    // given
    const readableStream = new stream.Readable({
      objectMode: true,
    });
    readableStream.push({ feature: 'fist' });
    readableStream.push({ feature: 'second' });
    readableStream.push({ feature: 'third' });
    readableStream.push(null);
    writableStream = new InMemoryWritable();

    // when
    readableStream.pipe(new FeatureCollectionWrapper()).pipe(writableStream);

    await new Promise((resolve) => writableStream.on('finish', resolve));
  });

  it(`should return parsable empty collection`, () => {
    expect(JSON.parse(writableStream.data.join(''))).toStrictEqual({
      features: [
        { feature: 'fist' },
        { feature: 'second' },
        { feature: 'third' },
      ],
      type: 'FeatureCollection',
    });
  });
});

class InMemoryWritable extends stream.Writable {
  public readonly data: any[] = [];
  _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
    this.data.push(chunk.toString());
    callback();
  }
}
