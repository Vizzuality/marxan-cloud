import { bootstrapApplication } from '../../utils';
import { getFixtures } from './cleanup.fixtures';

describe('when dangling cost surface data exists in (geo)DB', () => {
  let fixtures: any;
  let app: any;

  beforeEach(async () => {
    app = await bootstrapApplication();
    fixtures = await getFixtures(app);
  });

  afterEach(async () => {
    await fixtures.cleanup();
  });
  it('cleanup task removes dangling cost surfaces', async () => {
    await fixtures.GivenDanglingCostSurfaceDataExists();

    await fixtures.WhenCleanupIsExecuted();

    await fixtures.ThenDanglingCostSurfaceDataIsRemoved();
  });
});
