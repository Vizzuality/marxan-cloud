// eslint-disable-next-line @typescript-eslint/no-var-requires
const VectorTile = require('@mapbox/vector-tile').VectorTile;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Protobuf = require('pbf');

import { GeoJSON } from 'geojson';

export const decodeMvt = (
  buffer: Buffer,
): {
  layers: Record<
    string,
    {
      _features: unknown[];
      feature: (index: number) => {
        properties: Record<string, unknown>;
        extent: number;
        toGeoJSON: (x: number, y: number, z: number) => GeoJSON;
        bbox: () => [number, number, number, number];
        loadGeometry: () => Array<Array<{ x: number; y: number }>>; // actually
        // Point class of point-geometry from mapbox
      };
    }
  >;
} => new VectorTile(new Protobuf(buffer));
