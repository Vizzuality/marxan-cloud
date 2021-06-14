import { TransformCallback, Transform } from 'stream';

export class FeatureCollectionWrapper extends Transform {
  private firstChunk = true;
  private prefix = `{"type":"FeatureCollection","features":[`;

  constructor() {
    super({
      objectMode: true,
    });
  }

  _transform(
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ) {
    if (this.firstChunk) {
      this.firstChunk = false;
      callback(null, this.prefix + JSON.stringify(chunk));
    } else {
      callback(null, `,` + JSON.stringify(chunk));
    }
  }

  _flush(callback: TransformCallback) {
    callback(null, (this.firstChunk ? this.prefix : '') + `]}`);
  }
}
