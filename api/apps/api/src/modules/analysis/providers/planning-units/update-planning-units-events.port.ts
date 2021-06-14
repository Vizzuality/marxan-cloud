/**
 * API side cannot set other states: `Finished` will only be set
    by the job processor handling this task.
 */
export enum UpdatePlanningUnitsState {
  Submitted = 'submitted',
  Failed = 'failed',
}

export abstract class UpdatePlanningUnitsEventsPort {
  abstract event(
    scenarioId: string,
    state: UpdatePlanningUnitsState,
    context?: Record<string, unknown> | Error,
  ): Promise<void>;
}
