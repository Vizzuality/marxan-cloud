import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { HttpStatus } from '@nestjs/common';
import { getProjectTagsFixtures } from './project-tags.fixtures';
import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';

let fixtures: FixtureType<typeof getProjectTagsFixtures>;

describe('Projects Tag ACL DELETE (e2e)', () => {
  beforeEach(async () => {
    fixtures = await getProjectTagsFixtures();
  });

  afterEach(async () => {
    await fixtures?.cleanup();
  });

  test('should return error if Project not editable by user', async () => {
    // ARRANGE
    const viewerProjectId = await fixtures.GivenProject('someProject', [
      ProjectRoles.project_viewer,
    ]);
    const viewerFeatureId = await fixtures.GivenFeatureOnProject(
      viewerProjectId,
      'someFeature',
    );
    const newTag = 'valid-tag🙂';
    await fixtures.GivenTagOnFeature(viewerProjectId, viewerFeatureId, newTag);

    // ACT
    const response = await fixtures.WhenDeletingAProjectTag(
      viewerProjectId,
      newTag,
    );

    // ASSERT
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    await fixtures.ThenProjectNotEditableErrorWasReturned(
      response,
      viewerProjectId,
    );
    await fixtures.ThenFeatureHasTag(viewerProjectId, viewerFeatureId, newTag);
  });
});

describe('Projects Tag ACL PATCH (e2e)', () => {
  beforeEach(async () => {
    fixtures = await getProjectTagsFixtures();
  });

  afterEach(async () => {
    await fixtures?.cleanup();
  });

  test('should return error if Project not editable by user', async () => {
    // ARRANGE
    const viewerProjectId = await fixtures.GivenProject('p', [
      ProjectRoles.project_viewer,
    ]);
    const viewerFeatureId = await fixtures.GivenFeatureOnProject(
      viewerProjectId,
      'f',
    );
    const tag = 'valid-tag🙂';
    await fixtures.GivenTagOnFeature(viewerProjectId, viewerFeatureId, tag);

    // ACT
    const response = await fixtures.WhenPatchingAProjectTag(
      viewerProjectId,
      tag,
      'FANCY-NEW-TAG',
    );

    // ASSERT
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    await fixtures.ThenProjectNotEditableErrorWasReturned(
      response,
      viewerProjectId,
    );
    await fixtures.ThenFeatureHasTag(viewerProjectId, viewerFeatureId, tag);
  });
});
describe('Projects Tag ACL GET (e2e)', () => {
  beforeEach(async () => {
    fixtures = await getProjectTagsFixtures();
  });

  afterEach(async () => {
    await fixtures?.cleanup();
  });

  test('should return error if Project not visible to user', async () => {
    // ARRANGE
    const externalProjectId = await fixtures.GivenProject('someProject', []);
    const externalFeatureId = await fixtures.GivenFeatureOnProject(
      externalProjectId,
      'someFeature',
    );
    const newTag = 'valid-tag🙂';
    await fixtures.GivenTagOnFeature(
      externalProjectId,
      externalFeatureId,
      newTag,
    );

    // ACT
    const response = await fixtures.WhenGettingProjectTags(
      externalProjectId,
      'valid',
      'tag',
    );

    // ASSERT
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    await fixtures.ThenProjectNotVisibleErrorWasReturned(
      response,
      externalProjectId,
    );
  });
});

// @todo Skipped because projects/:id/features doesn't currently implement ACL checks and is TODO
// First implementation for future use/tweaks
describe.skip('Projects Tag ACL GET Features (e2e)', () => {
  beforeEach(async () => {
    fixtures = await getProjectTagsFixtures();
  });

  afterEach(async () => {
    await fixtures?.cleanup();
  });

  test('should return error if Project not visible to user', async () => {
    // ARRANGE
    const externalProjectId = await fixtures.GivenProject('someProject', []);
    const externalFeatureId = await fixtures.GivenFeatureOnProject(
      externalProjectId,
      'someFeature',
    );
    const newTag = 'valid-tag🙂';
    await fixtures.GivenTagOnFeature(
      externalProjectId,
      externalFeatureId,
      newTag,
    );

    // ACT
    const response = await fixtures.WhenGettingFeaturesFromProject(
      externalProjectId,
      ['valid'],
    );

    // ASSERT
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
  });
});
