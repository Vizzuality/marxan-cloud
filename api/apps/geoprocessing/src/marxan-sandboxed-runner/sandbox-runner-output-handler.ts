import { Cancellable } from './ports/cancellable';
import { Workspace } from './ports/workspace';

export abstract class SandboxRunnerOutputHandler<T> implements Cancellable {
  abstract dump(
    workspace: Workspace,
    scenarioId: string,
    stdOutput: string[],
    stdErr?: string[],
  ): Promise<T>;

  abstract dumpFailure(
    workspace: Workspace,
    scenarioId: string,
    stdOutput: string[],
    stdError: string[],
  ): Promise<void>;

  abstract cancel(): Promise<void>;
}
