import { Cancellable } from './cancellable';

export class Workspace implements Cancellable {
  constructor(
    public readonly workingDirectory: string,
    public readonly marxanBinaryPath: string,
    public readonly cleanup: () => Promise<void>,
  ) {}

  cancel(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
