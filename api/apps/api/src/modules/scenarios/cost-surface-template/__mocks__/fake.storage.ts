import * as stream from 'stream';
import { Storage } from '../storage';

export class FakeStorage extends Storage {
  memory: Record<string, stream.Readable> = {};

  getStream(scenarioId: string) {
    return this.memory[scenarioId];
  }
}
