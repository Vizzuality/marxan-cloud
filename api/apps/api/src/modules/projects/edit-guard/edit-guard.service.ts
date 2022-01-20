export const doesntExist = Symbol(`doesn't exist`);
export type DoesntExist = typeof doesntExist;

export abstract class EditGuard {
  abstract ensureEditingIsAllowedFor(projectId: string): Promise<void>;
}
