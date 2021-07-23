import { Injectable } from '@nestjs/common';
import { createReadStream, readdirSync } from 'fs';
import { obj as multistream } from 'multistream';
import { createInterface } from 'readline';
import { PassThrough, TransformCallback } from 'stream';

@Injectable()
export class MvFileReader {
  from(directory: string): NodeJS.ReadableStream {
    // TODO replace hardcoded output
    const filesLocation = directory + `/output`;
    const files = readdirSync(filesLocation, {
      encoding: `utf8`,
      withFileTypes: true,
    })
      .filter((file) => file.isFile() && file.name.startsWith(`output_m`))
      .map((file) => filesLocation + '/' + file.name);

    // TODO pipe which adds runId & strip header
    return multistream(
      files.map((fileName, index) => {
        const stream = new PassThrough({
          objectMode: true,
        });
        const lineReaderEmitter = createInterface({
          input: createReadStream(fileName),
          crlfDelay: Infinity,
        });
        lineReaderEmitter.on('line', (line) => stream.push(line));
        return stream.pipe(new InjectRunId(index));
      }),
    );
  }
}

import { Transform } from 'stronger-typed-streams';

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
