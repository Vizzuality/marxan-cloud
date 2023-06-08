import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GeoFeatureTag } from '@marxan-api/modules/geo-feature-tags/geo-feature-tag.api.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { E2E_CONFIG } from '../e2e.config';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { Organization } from '@marxan-api/modules/organizations/organization.api.entity';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { AppConfig } from '@marxan-api/utils/config.utils';

let fixtures: FixtureType<typeof getFixtures>;

const tagMaxlength = AppConfig.get<number>('marxan.maxTagLength');

describe('GeoFeatureTag PATCH (e2e)', () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  afterEach(async () => {
    await fixtures?.cleanup();
  });

  test('should return error if the tag is empty', async () => {
    //ARRANGE
    const oldTag = 'oldTag';
    const projectId = await fixtures.GivenProject('someProject');
    const featureId = await fixtures.GivenFeatureOnProject(
      projectId,
      'notToBeTagged',
    );
    await fixtures.GivenTagOnFeature(projectId, featureId, oldTag);

    // ACT
    const response = await fixtures.WhenPatchingAGeoFeatureTag(
      projectId,
      featureId,
      '',
    );

    //ASSERT
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    fixtures.ThenEmptyErrorWasReturned(response);
    await fixtures.ThenFeatureHasTag(projectId, featureId, oldTag);
  });

  test('should return error if the tag is longer than the configurable maximum tag length', async () => {
    //ARRANGE
    const oldTag = 'oldTag';
    const newTag = 'a-very-looooooooooooooooooooooooooooooooooooooooooong-tag';
    const projectId = await fixtures.GivenProject('someProject');
    const featureId = await fixtures.GivenFeatureOnProject(
      projectId,
      'notToBeTagged',
    );
    await fixtures.GivenTagOnFeature(projectId, featureId, oldTag);

    // ACT
    const response = await fixtures.WhenPatchingAGeoFeatureTag(
      projectId,
      featureId,
      newTag,
    );

    //ASSERT
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    fixtures.ThenMaxLengthErrorWasReturned(response);
    await fixtures.ThenFeatureHasTag(projectId, featureId, oldTag);
  });

  test('should return error if the tag is invalid', async () => {
    // ARRANGE
    const oldTag = 'oldTag';
    const newTag = 'INVALID\nTAG\rwith\r\nnewline';
    const projectId = await fixtures.GivenProject('someProject');
    const featureId = await fixtures.GivenFeatureOnProject(
      projectId,
      'notToBeTagged',
    );
    await fixtures.GivenTagOnFeature(projectId, featureId, oldTag);

    // ACT
    const response = await fixtures.WhenPatchingAGeoFeatureTag(
      projectId,
      featureId,
      newTag,
    );

    //ASSERT
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    fixtures.ThenInvalidTagErrorWasReturned(response);
    await fixtures.ThenFeatureHasTag(projectId, featureId, oldTag);
  });

  test('should update the tag of the geo feature with the provided one for the given project', async () => {
    // ARRANGE
    const projectId = await fixtures.GivenProject('someProject');
    const featureId = await fixtures.GivenFeatureOnProject(
      projectId,
      'someFeature',
    );
    await fixtures.GivenTagOnFeature(projectId, featureId, 'oldTag');
    const newTag = 'valid-tag🙂';

    // ACT
    const response = await fixtures.WhenPatchingAGeoFeatureTag(
      projectId,
      featureId,
      newTag,
    );

    // ASSERT
    expect(response.status).toBe(HttpStatus.OK);
    await fixtures.ThenFeatureHasTag(projectId, featureId, newTag);
  });

  test('should tag the feature properly, even if the feature does not previously have a tag', async () => {
    // ARRANGE
    const projectId = await fixtures.GivenProject('someProject');
    const featureId = await fixtures.GivenFeatureOnProject(
      projectId,
      'someFeature',
    );
    const newTag = 'valid-tag🙂';

    // ACT
    const response = await fixtures.WhenPatchingAGeoFeatureTag(
      projectId,
      featureId,
      newTag,
    );

    // ASSERT
    expect(response.status).toBe(HttpStatus.OK);
    await fixtures.ThenFeatureHasTag(projectId, featureId, newTag);
  });

  test('should update with a previous existing equivalent tag instead of the provided one, if, on the same project, there is an existing equivalent tag with different capitalization', async () => {
    //ARRANGE
    const newTag = 'SoME-taG';
    const equivalentTag = newTag.toLowerCase();
    const projectId = await fixtures.GivenProject('someProject');
    const featureId = await fixtures.GivenFeatureOnProject(
      projectId,
      'toBeTagged',
    );
    const featureWithEquivalentTagId = await fixtures.GivenFeatureOnProject(
      projectId,
      'featureEquivalentTag',
    );
    await fixtures.GivenTagOnFeature(projectId, featureId, 'oldTag');
    await fixtures.GivenTagOnFeature(
      projectId,
      featureWithEquivalentTagId,
      equivalentTag,
    );

    // ACT
    const response = await fixtures.WhenPatchingAGeoFeatureTag(
      projectId,
      featureId,
      newTag,
    );

    //ASSERT
    expect(response.status).toBe(HttpStatus.OK);
    await fixtures.ThenFeatureHasTag(projectId, featureId, equivalentTag);
  });
});

/////////////////
// FIXTURES
const getFixtures = async () => {
  const app = await bootstrapApplication();
  const userToken = await GivenUserIsLoggedIn(app, 'aa');

  const projectsRepo: Repository<Project> = app.get(
    getRepositoryToken(Project),
  );
  const organizationsRepo: Repository<Organization> = app.get(
    getRepositoryToken(Organization),
  );
  const geoFeatureRepo: Repository<GeoFeature> = app.get(
    getRepositoryToken(GeoFeature),
  );
  const geoFeatureTagRepo: Repository<GeoFeatureTag> = app.get(
    getRepositoryToken(GeoFeatureTag),
  );

  const organizationId = (
    await OrganizationsTestUtils.createOrganization(
      app,
      userToken,
      E2E_CONFIG.organizations.valid.minimal(),
    )
  ).data.id;

  return {
    cleanup: async () => {
      await geoFeatureTagRepo.delete({});
      await projectsRepo.delete({});
      await geoFeatureRepo.delete({});
      await organizationsRepo.delete({});

      await app.close();
    },

    // ARRANGE
    GivenProject: async (projectName: string) => {
      const projectDTO = {
        ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
          countryId: 'NAM',
        }),
        name: projectName,
        organizationId,
      };

      const projectResult = await ProjectsTestUtils.createProject(
        app,
        userToken,
        projectDTO,
      );

      return projectResult.data.id;
    },
    GivenFeatureOnProject: async (projectId: string, featureName: string) => {
      const results: {
        id: string;
      }[] = await geoFeatureRepo.query(`INSERT INTO features
            (feature_class_name, alias, description, property_name, intersection, project_id, creation_status, created_by)
          VALUES
            ('${featureName}', 'alias_${featureName}', null, ' name', null, '${projectId}', 'created', (SELECT id FROM users WHERE email = 'aa@example.com'))
          RETURNING id;
        `);

      return results[0].id;
    },

    GivenTagOnFeature: async (
      projectId: string,
      featureId: string,
      tag: string,
    ) =>
      await geoFeatureTagRepo.query(`INSERT INTO project_feature_tags
            (project_id, feature_id, tag)
          VALUES
            ('${projectId}', '${featureId}', '${tag}' ) `),

    // ACT
    WhenPatchingAGeoFeatureTag: (
      projectId: string,
      featureId: string,
      tagName: string,
    ) =>
      request(app.getHttpServer())
        .patch(`/api/v1/geo-features/${featureId}/tags`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ projectId, tagInfo: { tagName } }),

    // ASSERT
    ThenEmptyErrorWasReturned: (response: request.Response) => {
      const error: any =
        response.body.errors[0].meta.rawError.response.message[0];
      expect(error).toContain(`tagName should not be empty`);
    },

    ThenMaxLengthErrorWasReturned: (response: request.Response) => {
      const error: any =
        response.body.errors[0].meta.rawError.response.message[0];
      expect(error).toContain(
        `tagName length should not be longer than ${tagMaxlength} characters`,
      );
    },

    ThenInvalidTagErrorWasReturned: (response: request.Response) => {
      const error: any =
        response.body.errors[0].meta.rawError.response.message[0];
      expect(error).toContain(`tagName cannot contain newline characters`);
    },

    ThenFeatureHasTag: async (
      projectId: string,
      featureId: string,
      tag: string,
    ) => {
      const featureTags = await geoFeatureTagRepo.find({
        where: { projectId, featureId },
      });
      expect(featureTags).toHaveLength(1);
      expect(featureTags[0].tag).toEqual(tag);
    },
  };
};
