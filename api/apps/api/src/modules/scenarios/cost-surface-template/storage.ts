import * as stream from 'stream';
export abstract class Storage {
  abstract getStream(scenarioId: string): stream.Readable | undefined;
}
