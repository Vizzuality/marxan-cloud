import { difference } from 'lodash';

export const canPlanningUnitsBeLocked = (
  puids: number[],
  availablePuids: number[],
): { errors: string[] } => {
  const diff = difference(puids, availablePuids);
  return {
    errors: diff.map(
      (missingId) =>
        `This project doesn't have a planning unit with ${missingId} as puid`,
    ),
  };
};
