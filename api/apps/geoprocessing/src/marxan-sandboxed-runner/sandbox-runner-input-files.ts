import { Assets } from '@marxan/scenario-run-queue';
import { Workspace } from './ports/workspace';
import { Cancellable } from './ports/cancellable';

export abstract class SandboxRunnerInputFiles implements Cancellable {
  abstract include(workspace: Workspace, assets: Assets): Promise<void>;

  abstract cancel(): Promise<void>;
}
