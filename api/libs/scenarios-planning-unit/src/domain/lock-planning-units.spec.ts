import { lockPlanningUnits } from './lock-planning-units';

const fixtures = {
  availablePlanningUnits: ['1', '2', '3', '4'],
  someOfTheAvailable: ['1', '4'],
  withNonAvailable: ['1', '5'],
};

test.each([
  [fixtures.availablePlanningUnits, fixtures.availablePlanningUnits, 0],
  [fixtures.someOfTheAvailable, fixtures.availablePlanningUnits, 0],
  [fixtures.withNonAvailable, fixtures.availablePlanningUnits, 1],
  [[], fixtures.availablePlanningUnits, 0],
  [fixtures.someOfTheAvailable, [], fixtures.someOfTheAvailable.length],
])(
  `when changing %p out of %p, it returns %p errors`,
  (unitsToChange, availableUnits, errorsCount) => {
    expect(
      lockPlanningUnits(unitsToChange, availableUnits).errors.length,
    ).toEqual(errorsCount);
  },
);
