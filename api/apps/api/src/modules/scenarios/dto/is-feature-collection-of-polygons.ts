import { registerDecorator, ValidationOptions } from 'class-validator';
import { FeatureCollection } from 'geojson';
import { tryGeoJSON } from 'pure-geojson-validation';

/**
 * Does not validate nested FeatureCollections
 * @param validationOptions
 * @constructor
 */
export const IsFeatureCollectionOfPolygons = (
  validationOptions: ValidationOptions,
) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'IsFeatureCollectionOfPolygons',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: {
        message:
          'Value must be a valid GeoJson of FeatureCollection of (Polygon/MultiPolygon)',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          try {
            const geo = tryGeoJSON(value);
            if (geo.type !== 'FeatureCollection') {
              return false;
            }
            return (geo as FeatureCollection).features.every(
              (geometry) =>
                geometry.geometry.type === 'MultiPolygon' ||
                geometry.geometry.type === 'Polygon',
            );
          } catch {
            return false;
          }
        },
      },
    });
  };
};
