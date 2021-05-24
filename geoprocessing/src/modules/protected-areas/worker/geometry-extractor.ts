import { Injectable } from '@nestjs/common';
import { GeoJSON, Geometry, MultiPolygon, Polygon } from 'geojson';

@Injectable()
export class GeometryExtractor {
  extract(geo: GeoJSON): (MultiPolygon | Polygon)[] {
    let geometries: (MultiPolygon | Polygon)[] = [];

    if (geo.type === 'FeatureCollection') {
      geometries = geo.features
        .map((feature) => feature.geometry)
        .filter(this.#isGeometrySupported);
    }

    if (geo.type === 'MultiPolygon' || geo.type === 'Polygon') {
      geometries.push(geo);
    }

    return geometries;
  }

  #isGeometrySupported = (geo: Geometry): geo is MultiPolygon | Polygon =>
    geo.type === 'MultiPolygon' || geo.type === 'Polygon';
}
