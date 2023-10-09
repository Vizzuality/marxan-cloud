import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from '../projects.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
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
  const scenarioId = await fixtures.GivenScenarioWasCreated(projectId);
  let response = await fixtures.WhenPublishingAProject(projectId, scenarioId);
  fixtures.ThenCreatedIsReturned(response);
  response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenPublicProjectIsAvailable(projectId, response);
});

test(`when placing a public project under moderation as a platform admin`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  const scenarioId = await fixtures.GivenScenarioWasCreated(projectId);
  let response = await fixtures.WhenPublishingAProject(projectId, scenarioId);
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
  const scenarioId = await fixtures.GivenScenarioWasCreated(projectId);
  let response = await fixtures.WhenPublishingAProject(projectId, scenarioId);
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
  const scenarioId = await fixtures.GivenScenarioWasCreated(projectId);
  let response = await fixtures.WhenPublishingAProject(projectId, scenarioId);
  fixtures.ThenCreatedIsReturned(response);
  response = await fixtures.WhenPlacingAPublicProjectUnderModerationNotAsAdmin(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(response);
  response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenPublicProjectIsAvailable(projectId, response);
  response = await fixtures.WhenGettingPublicProject(projectId);
  fixtures.ThenCompletePublicProjectDetailsWithoutExportIdArePresent(
    projectId,
    response,
  );
});

test(`when clearing under moderation status from a public project not as platform admin`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  const scenarioId = await fixtures.GivenScenarioWasCreated(projectId);
  let response = await fixtures.WhenPublishingAProject(projectId, scenarioId);
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
  const scenarioId = await fixtures.GivenScenarioWasCreated(projectId);
  let response = await fixtures.WhenPublishingAProject(projectId, scenarioId);
  fixtures.ThenCreatedIsReturned(response);

  response = await fixtures.WhenUnpublishingAProjectAsProjectOwner(projectId);
  fixtures.ThenCreatedIsReturned(response);
  response = await fixtures.WhenGettingPublicProjects();
  fixtures.ThenNoProjectIsAvailable(response);
});

test(`when unpublishing a public project that is under moderation as a project owner`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  const scenarioId = await fixtures.GivenScenarioWasCreated(projectId);
  let response = await fixtures.WhenPublishingAProject(projectId, scenarioId);
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
  const scenarioId = await fixtures.GivenScenarioWasCreated(projectId);
  let response = await fixtures.WhenPublishingAProject(projectId, scenarioId);
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

test(`when updating a public project as the project owner`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  const scenarioId = await fixtures.GivenScenarioWasCreated(projectId);
  let response = await fixtures.WhenPublishingAProject(projectId, scenarioId);
  fixtures.ThenCreatedIsReturned(response);
  response = await fixtures.WhenUpdatingAPublicProject(projectId);
  fixtures.ThenPublicProjectIsUpdated(projectId, response);
});

test(`when updating a public project as not project owner`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  const scenarioId = await fixtures.GivenScenarioWasCreated(projectId);
  let response = await fixtures.WhenPublishingAProject(projectId, scenarioId);
  fixtures.ThenCreatedIsReturned(response);
  response = await fixtures.WhenUpdatingAPublicProjectAsNotIncludedUser(
    projectId,
  );
  fixtures.ThenForbiddenIsReturned(response);
});

test(`when publishing a project an exportId should be generated to be used in imports`, async () => {
  const projectId = await fixtures.GivenPrivateProjectWasCreated();
  const scenarioId = await fixtures.GivenScenarioWasCreated(projectId);
  let response = await fixtures.WhenPublishingAProject(projectId, scenarioId);
  fixtures.ThenCreatedIsReturned(response);

  response = await fixtures.WhenGettingPublicProject(projectId);
  fixtures.ThenCompletePublicProjectDetailsWithoutExportIdArePresent(
    projectId,
    response,
  );

  const publicProjectExportId = await fixtures.GivenPublicProjectExportIdIsAvailable(
    projectId,
  );

  if (!publicProjectExportId) {
    throw Error('This public project has no exportId');
  }

  const exportId = await fixtures.GivenPublicProjectHasAnExportPrepared(
    publicProjectExportId,
  );

  const {
    importId,
    projectId: newProjectId,
  } = await fixtures.WhenCloningAPublicProject(exportId);

  await fixtures.ThenTheProjectShouldBeImported(newProjectId, importId);

  response = await fixtures.WhenGettingPublicProject(projectId);
  fixtures.ThenCompletePublicProjectDetailsWithExportIdArePresent(
    projectId,
    response,
  );
});

test(`when cloning a project that does not belong to the requesting user, it should import the public project`, async () => {
  const projectId = await fixtures.GivenPublicProjectWasCreated();
  const exportId = await fixtures.GivenProjectHasAnExportPrepared(projectId);

  const {
    importId,
    projectId: newProjectId,
  } = await fixtures.WhenCloningAPublicProject(exportId);

  await fixtures.ThenTheProjectShouldBeImported(newProjectId, importId);
});
