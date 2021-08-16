/**
 * Each value should reflect the API_EVENT_KINDS
 * "some.status.(submitted|finished|failed)/v1..."
 * withing the "some.status" part
 */
export enum JobType {
  CostSurface = 'scenario.costSurface',
  Run = 'scenario.run',
  PlanningUnitInclusion = 'scenario.planningUnitsInclusion',
<<<<<<< HEAD
  GeoprocessingCopy = 'scenario.geofeatureCopy',
  GeoprocessingSplit = 'scenario.geofeatureSplit',
  GeoprocessingStratification = 'scenario.geofeatureStratification',
=======
  PlanningUnitPACalculation = 'scenario.planningAreaProtectedCalculation',
>>>>>>> added some fixes to job status
}
