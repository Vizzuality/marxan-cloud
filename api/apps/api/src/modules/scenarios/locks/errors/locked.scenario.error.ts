export class LockedScenarioError extends Error {
  constructor() {
    super('Scenario is locked.');
  }
}
