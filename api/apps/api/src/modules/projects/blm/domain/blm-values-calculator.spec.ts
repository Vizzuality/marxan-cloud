import { BlmValuesCalculator } from '@marxan-api/modules/projects/blm/domain/blm-values-calculator';

describe('blm-values-calculator', () => {
  const blmValuesCalculator = new BlmValuesCalculator();

  it('should calculate the correct default values', async () => {
    const defaultValues = blmValuesCalculator.withDefaultRange();

    expect(defaultValues).toStrictEqual([
      0.001, 20.0008, 40.0006, 60.0004, 80.0002, 100,
    ]);
  });

  it('should calculate the correct values with a given range', async () => {
    const values = blmValuesCalculator.with([0, 50]);

    expect(values).toStrictEqual([0, 10, 20, 30, 40, 50]);
  });

  it('should return values within the given range', async () => {
    const ranges: [number, number][] = [
      [0, 1],
      [0, 10],
      [10, 20],
      [100, 1000],
      [0, 100000],
    ];

    ranges.forEach(([min, max]) => {
      const values = blmValuesCalculator.with([min, max]);
      values.forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThanOrEqual(max);
      });
    });
  });
});
