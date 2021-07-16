export class Progress {
  private previousChunk = '';
  private outOf?: number;
  private runsMade: Record<number, true> = {};

  read(chunk: Buffer): number {
    const current = chunk.toString();
    const joined = this.previousChunk + current;
    const matches = joined.matchAll(/Run (\d+) is finished \(out of (\d+)\)./g);
    this.previousChunk = current;
    for (const match of matches) {
      const [, currentRun, currentTotal] = match;
      this.outOf ??= +currentTotal;
      this.runsMade[+currentRun] = true;
    }
    return Object.keys(this.runsMade).length / (this.outOf ?? NaN);
  }
}
