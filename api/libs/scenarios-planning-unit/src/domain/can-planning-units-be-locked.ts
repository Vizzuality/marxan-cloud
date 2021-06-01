import { difference } from 'lodash';

export const canPlanningUnitsBeLocked = (
  planningUnitsIds: string[],
  availablePlanningUnitsIds: string[],
): { errors: string[] } => {
  const diff = difference(planningUnitsIds, availablePlanningUnitsIds);
  return {
    errors: diff.map(
      (missingId) =>
        `Planning Unit with id ${missingId} is not a part of this project`,
    ),
  };
};
