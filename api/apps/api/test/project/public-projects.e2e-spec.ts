import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './projects.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});
afterEach(async () => {
  await fixtures?.cleanup();
});

test(`getting public projects while none is available`, async () => {
  await fixtures.GivenPrivateProjectWasCreated();
  const response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenNoProjectIsAvailable(response);
});

test(`getting public projects`, async () => {
  const publicProjectId = await fixtures.GivenPublicProjectWasCreated();
  await fixtures.GivenPrivateProjectWasCreated();
  const response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenPublicProjectIsAvailable(publicProjectId, response);
});

test(`publishing a project`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  let response = await fixtures.WhenPublishingAProject(projectId);
  fixtures.ThenNoContentIsReturned(response);
  response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenPublicProjectIsAvailable(projectId, response);
});

test(`when unpublishing a project as a platform admin`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  let response = await fixtures.WhenPublishingAProject(projectId);
  fixtures.ThenNoContentIsReturned(response);
  response = await fixtures.WhenUnpublishingAProjectAsAdmin(projectId);
  fixtures.ThenNoContentIsReturned(response);

  // Test that findAll only shows project for admin
  response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenNoProjectIsAvailable(response);
  response = await fixtures.WhenGettingPublicProjectsAsAdmin();
  fixtures.ThenPublicProjectWithUnpublishedStatusIsAvailable(
    projectId,
    response,
  );

  response = await fixtures.WhenGettingPublicProject(projectId);
  fixtures.ThenNotFoundIsReturned(response);
});

test(`when unpublishing a project as not a platform admin`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  let response = await fixtures.WhenPublishingAProject(projectId);
  fixtures.ThenNoContentIsReturned(response);
  response = await fixtures.WhenUnpublishingAProjectNotAsAdmin(projectId);
  fixtures.ThenForbiddenIsReturned(response);
  response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenPublicProjectIsAvailable(projectId, response);
});
