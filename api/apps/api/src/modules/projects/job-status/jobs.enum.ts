/**
 * Each value should reflect the API_EVENT_KINDS
 * "some.status.(submitted|finished|failed)/v1..."
 * withing the "some.status" part
 */
export enum JobType {
  CostSurface = 'scenario.costSurface',
  PlanningUnitInclusion = 'scenario.planningUnitsInclusion',
}
