import { registerDecorator, ValidationOptions } from 'class-validator';
import { tryGeometry } from 'pure-geojson-validation';

export const IsMultiPolygon = (
  validationOptions: ValidationOptions = {
    message: 'Value must be a valid Geometry(MultiPolygon)',
  },
) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'IsMultiPolygon',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          try {
            const geometry = tryGeometry(value);
            return geometry.type === 'MultiPolygon';
          } catch {
            return false;
          }
        },
      },
    });
  };
};
