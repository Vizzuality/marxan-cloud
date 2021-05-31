import * as stream from 'stream';
export abstract class Storage {
  abstract getStream(scenarioId: string): Promise<stream.Readable | undefined>;
}
