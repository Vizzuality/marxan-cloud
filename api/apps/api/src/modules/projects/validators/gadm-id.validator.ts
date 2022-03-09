import { registerDecorator, ValidationArguments } from 'class-validator';
import { CreateProjectDTO } from '../dto/create.project.dto';

export function HasCountryId() {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'hasCountryId',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const { countryId } = args.object as CreateProjectDTO;
          if (value) {
            return Boolean(countryId);
          }
          return true;
        },
        defaultMessage(_args: ValidationArguments) {
          return 'A level 1 admin area id was specified but a matching country id was not provided.';
        },
      },
    });
  };
}

export function HasLevel1AreaId() {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'hasLevel1AreaId',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const { adminAreaLevel1Id } = args.object as CreateProjectDTO;
          if (value) {
            return Boolean(adminAreaLevel1Id);
          }
          return true;
        },
        defaultMessage(_args: ValidationArguments) {
          return 'A level 2 admin area id was specified but a matching level 1 admin area id was not provided.';
        },
      },
    });
  };
}
