import { BlmValuesCalculator } from '@marxan-api/modules/projects/blm/domain/blm-values-calculator';

describe('blm-values-calculator', () => {
  it('should calculate the correct default values', async () => {
    const defaultValues = BlmValuesCalculator.withDefaultRange(1500);

    expect(defaultValues).toStrictEqual([
      0.03872983346207417,
      606.799665767047,
      1213.5606017006319,
      1820.3215376342168,
      2427.0824735678016,
      3033.8434095013868,
    ]);
  });

  it('should calculate the correct values with a given range', async () => {
    const values = BlmValuesCalculator.with([1, 50], 1500);

    expect(values).toStrictEqual([
      38.72983346207417,
      316.2936399402723,
      593.8574464184705,
      871.4212528966688,
      1148.985059374867,
      1426.548865853065,
    ]);
  });
});
