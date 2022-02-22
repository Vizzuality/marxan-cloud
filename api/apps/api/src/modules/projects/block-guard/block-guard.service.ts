export const doesntExist = Symbol(`doesn't exist`);
export type DoesntExist = typeof doesntExist;

export abstract class BlockGuard {
  abstract ensureThatProjectIsNotBlocked(projectId: string): Promise<void>;
  abstract ensureThatScenarioIsNotBlocked(scenarioId: string): Promise<void>;
}
