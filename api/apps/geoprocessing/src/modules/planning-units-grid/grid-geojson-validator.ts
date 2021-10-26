import { Injectable } from '@nestjs/common';
import {
  FeatureCollection,
  GeoJSON,
  GeoJsonProperties,
  Geometry,
  Polygon,
} from 'geojson';
import { Either, left, right } from 'fp-ts/Either';
import { isFeatureCollection } from '@marxan/utils/geo';

export const notFeatureCollections = Symbol(`not a feature collections`);
export const invalidFeatureGeometry = Symbol(`can only contain polygons`);

export type ValidationError =
  | typeof notFeatureCollections
  | typeof invalidFeatureGeometry;

@Injectable()
export class GridGeoJsonValidator {
  validate(
    geo: GeoJSON,
  ): Either<ValidationError, FeatureCollection<Polygon, GeoJsonProperties>> {
    if (!isFeatureCollection(geo)) {
      return left(notFeatureCollections);
    }

    if (!this.hasOnlyPolygons(geo)) {
      return left(invalidFeatureGeometry);
    }

    return right(geo);
  }

  private hasOnlyPolygons(
    geoJson: FeatureCollection<Geometry, GeoJsonProperties>,
  ): geoJson is FeatureCollection<Polygon, GeoJsonProperties> {
    return geoJson.features.every(
      (feature) => feature.geometry.type === 'Polygon',
    );
  }
}
