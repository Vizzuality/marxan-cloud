import { Polygon } from 'geojson';
import { Transform, TransformCallback } from 'stream';

export interface PlanningAreaCustomGridContentElement {
  puid: number;
  geom: number[];
  size: number;
}

export interface PlanningAreaCustomGridContent {
  planningUnits: PlanningAreaCustomGridContentElement[];
}

export const planningAreaCustomGridRelativePath = 'project-grid.json';
export const planningAreaCustomGridGeoJSONRelativePath =
  'project-grid/custom-grid.geojson';

export class PlanningAreaGridCustomTransform extends Transform {
  firstChunk = true;

  constructor() {
    super({
      objectMode: true,
    });
    this.push('{ "planningUnits": [\n');
  }

  _transform(
    chunk: { ewkb: Buffer; puid: string; size: number },
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    const record: PlanningAreaCustomGridContentElement = {
      geom: chunk.ewkb.toJSON().data,
      puid: parseInt(chunk.puid),
      size: chunk.size,
    };
    let transformedChunk =
      (this.firstChunk ? '' : ',\n') + JSON.stringify(record);

    callback(null, transformedChunk);

    if (this.firstChunk) {
      this.firstChunk = false;
    }
  }

  _flush(callback: TransformCallback): void {
    this.push(']}');
    callback();
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
    const transformedChunk =
      (this.firstChunk ? '' : ',\n') + JSON.stringify(polygon.coordinates);

    callback(null, transformedChunk);

    if (this.firstChunk) {
      this.firstChunk = false;
    }
  }

  _flush(callback: TransformCallback): void {
    this.push(']}');
    callback();
  }
}
