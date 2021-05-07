import { INestApplication } from '@nestjs/common';
import { v4 } from 'uuid';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { WhenRequestingStatus } from './steps/WhenRequestingStatus';
import { WhenChangingPlanningUnitInclusivity } from './steps/WhenChangingPlanningUnitInclusivity';

let app: INestApplication;
let jwtToken: string;
let scenarioId: string;

beforeAll(async () => {
  app = await bootstrapApplication();
  jwtToken = await GivenUserIsLoggedIn(app);
  scenarioId = v4(); // not real yet
});

afterAll(async () => {
  await Promise.all([app.close()]);
});

describe(`when requesting to change inclusive options`, () => {
  it(`allows to request with valid input`, async () => {
    expect(
      await WhenChangingPlanningUnitInclusivity(app, scenarioId, jwtToken),
    ).toEqual({});
  });
});

describe(`when requesting status of change`, () => {
  it(`returns relevant status`, async () => {
    expect(await WhenRequestingStatus(app, scenarioId, jwtToken)).toEqual({
      status: 'running',
    });
  });
});
