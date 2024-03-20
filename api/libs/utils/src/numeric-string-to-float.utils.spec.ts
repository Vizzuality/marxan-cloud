import { numericStringToFloat } from './numeric-string-to-float.utils';

describe('parseOptionalFloat', () => {
  it('should return undefined if the value is undefined', () => {
    expect(numericStringToFloat(undefined)).toBeUndefined();
  });

  it('should throw an exception if the value is not numeric', () => {
    expect(() => numericStringToFloat('foo')).toThrow('Invalid number: foo');
  });

  it('should return a numeric representation of the value if the value is numeric', () => {
    expect(numericStringToFloat('123.456')).toBe(123.456);
  });

  it('should silently round a float to the maximum precision supported by javascript', () => {
    expect(numericStringToFloat('123.456789012345678901234567890')).toBe(
      123.45678901234568,
    );
  });
});
