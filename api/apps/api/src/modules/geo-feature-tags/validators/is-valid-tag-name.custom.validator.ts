import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// A tag is considered valid if it has no newline characters
@ValidatorConstraint()
export class IsValidTagNameValidator implements ValidatorConstraintInterface {
  public validate(tag: string) {
    const invalidCharactersExpression = new RegExp(/\r?\n|\r/g);

    return tag.match(invalidCharactersExpression) === null;
  }

  defaultMessage(args: ValidationArguments) {
    return `tagName cannot contain newline characters`;
  }
}
