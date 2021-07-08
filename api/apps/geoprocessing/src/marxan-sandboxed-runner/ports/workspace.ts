import { Cancellable } from './cancellable';
import { WorkingDirectory } from './working-directory';

export class Workspace implements Cancellable {
  constructor(
    public readonly workingDirectory: WorkingDirectory,
    public readonly marxanBinaryPath: string,
    public readonly cleanup: () => Promise<void>,
  ) {}

  cancel(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
