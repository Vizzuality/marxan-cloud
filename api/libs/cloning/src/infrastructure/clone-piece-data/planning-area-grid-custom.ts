import { Polygon } from 'geojson';
import { Transform, TransformCallback } from 'stream';

export const planningAreaCustomGridRelativePath = 'project-grid';
export const planningAreaCustomGridGeoJSONRelativePath =
  'project-grid/custom-grid.geojson';

export class PlanningAreaGridCustomTransform extends Transform {
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

export class PlanningAreaGridCustomGeoJsonTransform extends Transform {
  firstChunk = true;

  constructor(bbox: number[]) {
    super({
      objectMode: true,
    });
    this.push(
      `{ "type": "MultiPolygon", "bbox": [${bbox}], "coordinates": [\n`,
    );
  }

  _transform(
    chunk: { geojson: string },
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    const polygon: Polygon = JSON.parse(chunk.geojson);
    const data =
      (this.firstChunk ? '' : ',\n') + JSON.stringify(polygon.coordinates);

    callback(null, data);

    if (this.firstChunk) {
      this.firstChunk = false;
    }
  }

  _flush(callback: TransformCallback): void {
    this.push(']}');
    callback();
  }
}
