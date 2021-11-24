export class BlmValuesCalculator {
  private static cardinality = 6;
  private static defaultRange: [number, number] = [0.001, 100];

  private static execute(range: [number, number], area: number) {
    const [min, max] = range;
    const initialArray = Array(BlmValuesCalculator.cardinality - 1)
      .fill(0)
      .map((_, i) => i + 1);

    const formulaResults = initialArray.map(
      (i) => min + ((max - min) / BlmValuesCalculator.cardinality - 1) * i,
    );
    const blmValues = [min, ...formulaResults];

    return blmValues.map((value) => value * Math.sqrt(area));
  }

  static with(range: [number, number], area: number) {
    return BlmValuesCalculator.execute(range, area);
  }

  static withDefaultRange(area: number) {
    return BlmValuesCalculator.execute(BlmValuesCalculator.defaultRange, area);
  }
}
