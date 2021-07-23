import { Injectable } from '@nestjs/common';
import { createReadStream, readdirSync } from 'fs';
import { obj as multistream } from 'multistream';
import { createInterface } from 'readline';
import { PassThrough, TransformCallback } from 'stream';
import { Transform } from 'stronger-typed-streams';
import { isDefined } from '@marxan/utils';

@Injectable()
export class MvFileReader {
  from(directory: string): NodeJS.ReadableStream {
    // TODO replace hardcoded output name
    const filesLocation = directory + `/output`;

    const files = readdirSync(filesLocation, {
      encoding: `utf8`,
      withFileTypes: true,
    })
      .filter((file) => file.isFile())
      .map((file) => {
        const matcher = new RegExp(`^output_mv(?<runId>\\d+)\\.csv$`);
        const matches = matcher.exec(file.name);
        if (isDefined(matches?.groups?.runId)) {
          return {
            path: filesLocation + '/' + file.name,
            runId: parseInt(matches!.groups!.runId, 10),
          };
        }
        return undefined;
      })
      .filter(isDefined);

    return multistream(
      files.map(({ runId, path }) => {
        const stream = new PassThrough({
          objectMode: true,
        });
        const lineReaderEmitter = createInterface({
          input: createReadStream(path),
          crlfDelay: Infinity,
          // output: stream seems to hang forever...
        });
        lineReaderEmitter.on('line', (line) => {
          stream.push(line);
        });
        lineReaderEmitter.on('close', () => {
          stream.end();
        });
        return stream.pipe(new InjectRunId(runId));
      }),
    );
  }
}

class InjectRunId extends Transform<string, string> {
  #headerSkip = true;

  constructor(private readonly runId: number) {
    super({
      objectMode: true,
    });
  }

  _transform(
    chunk: string,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ) {
    if (this.#headerSkip) {
      this.#headerSkip = false;
      return callback(null, undefined);
    }
    callback(null, `${this.runId},${chunk}`);
  }
}
