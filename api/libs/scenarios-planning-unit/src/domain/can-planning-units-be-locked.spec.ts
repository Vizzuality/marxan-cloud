import { canPlanningUnitsBeLocked } from './can-planning-units-be-locked';
import { v4 } from 'uuid';

const availablePlanningUnits = [1, 2, 3, 4];

const fixtures = {
  availablePlanningUnits,
  someOfTheAvailable: [availablePlanningUnits[0], availablePlanningUnits[2]],
  withNonAvailable: [5, 6],
  everyAvailable: availablePlanningUnits,
  allAvailableAndOneMissing: [...availablePlanningUnits, 5],
};

type UnitsToChange = number[];
type AvailablePlanningUnits = number[];
type ErrorsCount = number;
type TestCase = [UnitsToChange, AvailablePlanningUnits, ErrorsCount];

test.each<TestCase>([
  [fixtures.availablePlanningUnits, fixtures.availablePlanningUnits, 0],
  [fixtures.someOfTheAvailable, fixtures.availablePlanningUnits, 0],
  [
    fixtures.withNonAvailable,
    fixtures.availablePlanningUnits,
    fixtures.withNonAvailable.length,
  ],
  [[], fixtures.availablePlanningUnits, 0],
  [fixtures.someOfTheAvailable, [], fixtures.someOfTheAvailable.length],
  [fixtures.everyAvailable, fixtures.availablePlanningUnits, 0],
  [fixtures.allAvailableAndOneMissing, fixtures.availablePlanningUnits, 1],
])(
  `when changing %p out of %p, it returns %p errors count`,
  (unitsToChange, availableUnits, errorsCount) => {
    expect(
      canPlanningUnitsBeLocked(unitsToChange, availableUnits).errors.length,
    ).toEqual(errorsCount);
  },
);
