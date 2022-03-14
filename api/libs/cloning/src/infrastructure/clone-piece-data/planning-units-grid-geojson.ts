import { Polygon } from 'geojson';
import { Transform, TransformCallback } from 'stream';

export const planningUnitsGridGeoJSONRelativePath =
  'planning-units-grid.geojson';

export class PlanningUnitsGridGeoJsonTransform extends Transform {
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
