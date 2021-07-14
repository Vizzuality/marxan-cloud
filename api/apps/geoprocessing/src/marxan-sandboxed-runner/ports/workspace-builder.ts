import { Workspace } from './workspace';

export abstract class WorkspaceBuilder {
  abstract get(): Promise<Workspace>;
}
