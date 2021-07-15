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

    // console.log(`---- processing chunk`, chunk);
    console.log(`---- processing solution`, solutionNumber);
    console.log(`---- pu total:`, puValues.length);

    const results: (SolutionRowResult & {
      raw: string;
      puid: number;
    })[] = puValues.map((puValue, index) => ({
      value: +puValue === 1 ? 1 : 0,
      runId: solutionNumber,
      spdId: this.solutionPuMapping[`${index + 1}`],
      raw: `index: ${index + 1} ; puValue: ${puValue}`,
      puid: index + 1,
    }));
    console.log(`---- result total:`, results.length);
    for (const k of results) {
      if (!k.spdId) {
        console.log(JSON.stringify(this.solutionPuMapping));
        return callback(
          new Error(
            'spd.id is missing for: ' +
              k.raw +
              '; mapping yields:' +
              this.solutionPuMapping[`${k.puid}`],
          ),
        );
      }
    }

    callback(null, results);
  }
}
