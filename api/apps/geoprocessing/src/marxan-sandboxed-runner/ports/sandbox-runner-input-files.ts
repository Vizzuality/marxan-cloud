import { Assets } from '@marxan/scenario-run-queue';
import { Workspace } from './workspace';
import { Cancellable } from './cancellable';

export abstract class SandboxRunnerInputFiles implements Cancellable {
  abstract include(workspace: Workspace, assets: Assets): Promise<void>;

  abstract cancel(): Promise<void>;
}
