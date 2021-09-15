// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import { GeoJSON } from 'geojson';

export const toVectorTile = (
  buffer: Buffer,
): {
  layers: Record<
    string,
    {
      feature: (
        index: number,
      ) => {
        properties: Record<string, unknown>;
        extent: number;
        toGeoJSON: () => GeoJSON;
        bbox: () => [number, number, number, number];
        loadGeometry: () => Array<Array<{ x: number; y: number }>>; // actually
        // Point class of point-geometry from mapbox
      };
    }
  >;
} => new VectorTile(new Protobuf(buffer));
