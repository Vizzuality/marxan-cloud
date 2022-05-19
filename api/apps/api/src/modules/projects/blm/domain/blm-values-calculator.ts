export const defaultBlmRange: [number, number] = [0.001, 10];

export class BlmValuesCalculator {
  constructor(
    private readonly cardinality = 6,
    private range: [number, number] = defaultBlmRange,
  ) {}

  private roundTo(number: number, amountOfDecimalDigits: number): number {
    if (number <= 0 || !Number.isInteger(amountOfDecimalDigits))
      throw new Error(
        `Invalid amount of decimal digits: ${amountOfDecimalDigits}`,
      );

    const factor = Math.pow(10, amountOfDecimalDigits);

    return Math.round(number * factor) / factor;
  }

  private execute() {
    const [min, max] = this.range;
    const initialArray = Array(this.cardinality)
      .fill(0)
      .map((_, i) => i);

    const minExp = Math.log10(min);
    const maxExp = Math.log10(max);
    const plusVal = (maxExp - minExp) / (this.cardinality - 1);

    const decimalDigits = Math.abs(Math.floor(minExp));

    const formulaResults = initialArray.map((i) => {
      const exponent = minExp + i * plusVal;

      return this.roundTo(Math.pow(10, exponent), decimalDigits);
    });
    return formulaResults;
  }

  with(range: [number, number]) {
    this.range = range;
    return this.execute();
  }

  withDefaultRange() {
    return this.execute();
  }
}
