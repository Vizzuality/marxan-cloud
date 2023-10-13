import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './planning-units-grid.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`uploading shapefile as planning units`, async () => {
  const shapefile = fixtures.GivenShapefileWasUploaded();
  const output =
    await fixtures.WhenConvertingShapefileToPlanningUnits(shapefile);
  await fixtures.ThenGeoJsonMatchesInput(output);
  await fixtures.ThenPlanningAreaIsCreated(output);
  await fixtures.ThenPlanningAreaBBoxIsValid(output);
  await fixtures.ThenThePUCostOfThatPlanningAreaIsCreated(output.id);
});

afterEach(async () => fixtures?.cleanup());
