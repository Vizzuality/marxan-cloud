import { getGeoFeatureTagsFixtures } from './geo-feature-tags.fixtures';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { HttpStatus } from '@nestjs/common';
import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';

let fixtures: FixtureType<typeof getGeoFeatureTagsFixtures>;

describe('GeoFeatureTag PATCH ACL (e2e)', () => {
  beforeEach(async () => {
    fixtures = await getGeoFeatureTagsFixtures();
  });

  afterEach(async () => {
    await fixtures?.cleanup();
  });

  test('should return forbidden error if feature is not editable (User has viewer role)', async () => {
    // ARRANGE
    const viewerProjectId = await fixtures.GivenProject('someProject', [
      ProjectRoles.project_viewer,
    ]);
    const viewerFeatureId = await fixtures.GivenFeatureOnProject(
      viewerProjectId,
      'someFeature2',
    );
    const newTag = 'valid-tag🙂';

    // ACT
    const response = await fixtures.WhenPatchingAGeoFeatureTag(
      viewerProjectId,
      viewerFeatureId,
      newTag,
    );

    // ASSERT
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    await fixtures.ThenFeatureNotEditableWithinProjectErrorWasReturned(
      response,
      viewerFeatureId,
      viewerProjectId,
    );
    await fixtures.ThenFeatureDoesNotHaveTag(
      viewerProjectId,
      viewerFeatureId,
      newTag,
    );
  });
});
