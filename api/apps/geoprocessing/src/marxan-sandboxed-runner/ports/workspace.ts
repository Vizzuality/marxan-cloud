import { Cancellable } from './cancellable';
import { WorkingDirectory } from './working-directory';

export class Workspace implements Cancellable {
  constructor(
    public readonly workingDirectory: WorkingDirectory,
    public readonly marxanBinaryPath: string,
    public readonly cleanup: () => Promise<void>,
    public readonly assembleOutputDirectory: () => Promise<void>,
  ) {}

  cancel(): Promise<void> {
    return this.cleanup();
  }

  arrangeOutputSpace() {
    return this.assembleOutputDirectory();
  }
}
