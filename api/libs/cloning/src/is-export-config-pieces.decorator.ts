import {
  isEnum,
  isUUID,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ClonePiece } from './domain/clone-piece';

@ValidatorConstraint()
export class IsExportConfigPiecesConstraint
  implements ValidatorConstraintInterface
{
  public async validate(value: any) {
    const validations: boolean[] = [];

    Object.entries(value).forEach(([key, value]) => {
      const valueIsArray = Array.isArray(value);
      validations.push(isUUID(key, 4));
      validations.push(valueIsArray);
      if (valueIsArray) {
        validations.push(
          (value as unknown[]).every((element) => isEnum(element, ClonePiece)),
        );
      }
    });

    return validations.every((validation) => validation);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} error`;
  }
}

export const IsExportConfigPieces = (options?: ValidationOptions) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'IsExportConfigPiecesConstraint',
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: new IsExportConfigPiecesConstraint(),
    });
  };
};
