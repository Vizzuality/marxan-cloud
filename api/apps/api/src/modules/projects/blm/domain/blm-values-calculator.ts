export class BlmValuesCalculator {
  constructor(
    private readonly cardinality = 6,
    private range: [number, number] = [0.001, 100],
  ) {}

  private execute() {
    const [min, max] = this.range;
    const initialArray = Array(this.cardinality - 1)
      .fill(0)
      .map((_, i) => i + 1);

    const formulaResults = initialArray.map(
      (i) => min + ((max - min) / (this.cardinality - 1)) * i,
    );
    const blmValues = [min, ...formulaResults];

    return blmValues.map((value) => value);
  }

  with(range: [number, number]) {
    this.range = range;
    return this.execute();
  }

  withDefaultRange() {
    return this.execute();
  }
}
