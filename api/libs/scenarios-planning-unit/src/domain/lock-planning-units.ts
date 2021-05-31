import { differenceWith } from 'lodash';

export const lockPlanningUnits = (
  planningUnitsIds: string[],
  availablePlanningUnitsIds: string[],
): { errors: string[] } => {
  const diff = differenceWith(planningUnitsIds, availablePlanningUnitsIds);
  return {
    errors: diff.map((missingId) => `Missing ${missingId}`),
  };
};
