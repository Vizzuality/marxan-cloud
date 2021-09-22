import { Injectable } from '@nestjs/common';
import { createReadStream, readdirSync } from 'fs';
import { obj as multistream } from 'multistream';
import { TransformCallback } from 'stream';
import { Transform } from 'stronger-typed-streams';
import { isDefined } from '@marxan/utils';
import { createStream as lineStream } from 'byline';

@Injectable()
export class MvFileReader {
  from(outputDirectory: string): NodeJS.ReadableStream {
    const files = readdirSync(outputDirectory, {
      encoding: `utf8`,
      withFileTypes: true,
    })
      .filter((file) => file.isFile())
      .map((file) => {
        const matcher = new RegExp(`^output_mv(?<runId>\\d+)\\.csv$`);
        const matches = matcher.exec(file.name);
        if (isDefined(matches?.groups?.runId)) {
          return {
            path: outputDirectory + '/' + file.name,
            runId: parseInt(matches!.groups!.runId, 10),
          };
        }
        return undefined;
      })
      .filter(isDefined);
    return multistream(
      files.map(({ runId, path }) =>
        lineStream(createReadStream(path), {
          objectMode: true,
        }).pipe(new InjectRunId(runId)),
      ),
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

  async _transform(
    chunk: string,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ) {
    if (this.#headerSkip) {
      this.#headerSkip = false;
      return callback(null, undefined);
    }
    await void 0;
    callback(null, `${this.runId},${chunk}`);
  }
}
