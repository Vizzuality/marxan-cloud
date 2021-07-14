import { Transform } from 'stronger-typed-streams';
import { TransformCallback } from 'stream';
import { PuToScenarioPu } from './pu-to-scenario-pu';
import { SolutionRowResult } from './solution-row-result';

export class SolutionTransformer extends Transform<
  string,
  SolutionRowResult[]
> {
  #headerAck = false;

  constructor(private readonly solutionPuMapping: PuToScenarioPu) {
    super({
      objectMode: true,
    });
  }

  _transform(
    chunk: string,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ) {
    if (!this.#headerAck) {
      this.#headerAck = true;
      return callback(null, []);
    }
    const [solutionString, ...puValues] = chunk.split(',');
    const solutionNumber = +solutionString.replace('S', '');

    callback(
      null,
      puValues.map<SolutionRowResult>((puValue, index) => ({
        value: +puValue === 1 ? 1 : 0,
        runId: solutionNumber,
        scenarioPuId: this.solutionPuMapping[index + 1],
      })),
    );
  }
}
