import { BlmValuesCalculator } from '@marxan-api/modules/projects/blm/domain/blm-values-calculator';

describe('blm-values-calculator', () => {
  const blmValuesCalculator = new BlmValuesCalculator();

  it('should calculate the correct default values', async () => {
    const defaultValues = blmValuesCalculator.withDefaultRange();

    expect(defaultValues).toStrictEqual([0.001, 0.006, 0.04, 0.251, 1.585, 10]);
  });

  it('should calculate the correct values with a given range', async () => {
    const values = blmValuesCalculator.with([0.1, 1000]);

    expect(values).toStrictEqual([0.1, 0.6, 4, 25.1, 158.5, 1000]);
  });
});
