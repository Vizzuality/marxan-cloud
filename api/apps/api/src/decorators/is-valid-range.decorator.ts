import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function IsValidRange(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isValidRange',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidRangeConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isValidRange', async: false })
class IsValidRangeConstraint implements ValidatorConstraintInterface {
  public validate(value: any) {
    return (
      Array.isArray(value) &&
      value.length === 2 &&
      !this.someValueIsNotAValidNumber(value) &&
      value[0] < value[1]
    );
  }

  public defaultMessage({ value }: ValidationArguments) {
    const invalidLengthMessage = `Received range [${value}] must have a length of 2`;
    const minIsGreaterThanMaxMessage = `Received range [${value}] has a min value greater than its max value`;
    const someValueIsNotANumberMessage = `Received range [${value.map(
      (v: any) => `${v}:${typeof v}`,
    )}] has some value that is not a number`;
    const rangeIsNotAnArrayMessage = `Received range ${value} is not an array`;
    const defaultMessage = `Received range [${value}] is not valid`;

    switch (true) {
      case !Array.isArray(value):
        return rangeIsNotAnArrayMessage;
      case value.length !== 2:
        return invalidLengthMessage;
      case value[0] > value[1]:
        return minIsGreaterThanMaxMessage;
      case this.someValueIsNotAValidNumber(value):
        return someValueIsNotANumberMessage;
      default:
        return defaultMessage;
    }
  }

  private someValueIsNotAValidNumber = (value: any) =>
    value.some((v: any) => typeof v !== 'number' || v < 0);
}
