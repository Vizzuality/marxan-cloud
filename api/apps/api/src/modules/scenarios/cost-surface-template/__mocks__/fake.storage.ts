import * as stream from 'stream';
import { Storage } from '../storage';

export class FakeStorage extends Storage {
  memory: Record<string, stream.Readable> = {};

  async getStream(scenarioId: string) {
    return this.memory[scenarioId];
  }
}
