export enum ScenarioCostSurfaceState {
  LinkToScenarioFailed = 'link-scenario-failed',
  LinkToScenarioFinished = 'link-scenario-finished',
  LinkToScenarioSubmitted = 'link-scenario-submitted',
}

export abstract class ScenarioCostSurfaceEventsPort {
  abstract event(
    scenarioId: string,
    state: ScenarioCostSurfaceState,
    context?: Record<string, unknown> | Error,
  ): Promise<void>;
}
