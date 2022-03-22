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
  fixtures.ThenCreatedIsReturned(response);
  response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenPublicProjectIsAvailable(projectId, response);
});

test(`when placing a public project under moderation as a platform admin`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  let response = await fixtures.WhenPublishingAProject(projectId);
  fixtures.ThenCreatedIsReturned(response);
  response = await fixtures.WhenPlacingAPublicProjectUnderModerationAsAdmin(
    projectId,
  );
  fixtures.ThenOkIsReturned(response);

  // Test that findAll only shows project for admin
  response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenNoProjectIsAvailable(response);
  response = await fixtures.WhenGettingPublicProjectsAsAdmin();
  fixtures.ThenPublicProjectWithUnderModerationStatusIsAvailable(
    projectId,
    response,
  );

  // Test that findOne only shows project for admin
  response = await fixtures.WhenGettingPublicProjectAsAdmin(projectId);
  fixtures.ThenPublicProjectDetailsWhileUnderModerationArePresent(
    projectId,
    response,
  );
  response = await fixtures.WhenGettingPublicProject(projectId);
  fixtures.ThenForbiddenIsReturned(response);
});

test(`when clearing under moderation status from a public project as a platform admin`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  let response = await fixtures.WhenPublishingAProject(projectId);
  fixtures.ThenCreatedIsReturned(response);
  response = await fixtures.WhenPlacingAPublicProjectUnderModerationAsAdmin(
    projectId,
  );
  fixtures.ThenOkIsReturned(response);

  response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenNoProjectIsAvailable(response);

  response = await fixtures.WhenClearingUnderModerationStatusFromAPublicProjectAsAdmin(
    projectId,
  );
  fixtures.ThenOkIsReturned(response);

  response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenPublicProjectIsAvailable(projectId, response);
});

test(`when placing a public project under moderation as not a platform admin`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  let response = await fixtures.WhenPublishingAProject(projectId);
  fixtures.ThenCreatedIsReturned(response);
  response = await fixtures.WhenPlacingAPublicProjectUnderModerationNotAsAdmin(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(response);
  response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenPublicProjectIsAvailable(projectId, response);
  response = await fixtures.WhenGettingPublicProject(projectId);
  fixtures.ThenPublicProjectDetailsArePresent(projectId, response);
});

test(`when clearing under moderation status from a public project not as platform admin`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  let response = await fixtures.WhenPublishingAProject(projectId);
  fixtures.ThenCreatedIsReturned(response);
  response = await fixtures.WhenPlacingAPublicProjectUnderModerationAsAdmin(
    projectId,
  );
  fixtures.ThenOkIsReturned(response);

  response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenNoProjectIsAvailable(response);

  response = await fixtures.WhenClearingUnderModerationStatusFromAPublicProjectNotAsAdmin(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(response);

  response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenNoProjectIsAvailable(response);
  response = await fixtures.WhenGettingPublicProject(projectId);
  fixtures.ThenForbiddenIsReturned(response);
});

test(`when unpublishing a public project as a project owner`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  let response = await fixtures.WhenPublishingAProject(projectId);
  fixtures.ThenCreatedIsReturned(response);

  response = await fixtures.WhenUnpublishingAProjectAsProjectOwner(projectId);
  fixtures.ThenCreatedIsReturned(response);
  response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenNoProjectIsAvailable(response);
});

test(`when unpublishing a public project that is under moderation as a project owner`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  let response = await fixtures.WhenPublishingAProject(projectId);
  fixtures.ThenCreatedIsReturned(response);
  response = await fixtures.WhenPlacingAPublicProjectUnderModerationAsAdmin(
    projectId,
  );
  fixtures.ThenOkIsReturned(response);

  response = await fixtures.WhenUnpublishingAProjectAsProjectOwner(projectId);
  fixtures.ThenBadRequestIsReturned(response);
  response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenNoProjectIsAvailable(response);
});

test(`when unpublishing a public project that is under moderation as a platform admin`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  let response = await fixtures.WhenPublishingAProject(projectId);
  fixtures.ThenCreatedIsReturned(response);
  response = await fixtures.WhenPlacingAPublicProjectUnderModerationAsAdmin(
    projectId,
  );
  fixtures.ThenOkIsReturned(response);

  response = await fixtures.WhenClearingUnderModerationStatusAndUnpublishingAsAdmin(
    projectId,
  );
  fixtures.ThenOkIsReturned(response);
  response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenNoProjectIsAvailable(response);
});
