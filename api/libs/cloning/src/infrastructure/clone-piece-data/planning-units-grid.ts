import { Transform, TransformCallback } from 'stream';

export const planningUnitsGridRelativePath = 'planning-units-grid';

export class PlanningUnitsGridTransform extends Transform {
  constructor() {
    super({
      objectMode: true,
    });
  }

  _transform(
    chunk: { ewkb: Buffer; puid: string },
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    const record = {
      geom: chunk.ewkb.toJSON().data,
      puid: parseInt(chunk.puid),
    };
    const content = `${record.puid},${JSON.stringify(record.geom)}\n`;
    callback(null, content);
  }
}
