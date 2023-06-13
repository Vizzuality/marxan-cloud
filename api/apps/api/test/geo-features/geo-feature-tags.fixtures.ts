import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { Repository } from 'typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Organization } from '@marxan-api/modules/organizations/organization.api.entity';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { GeoFeatureTag } from '@marxan-api/modules/geo-feature-tags/geo-feature-tag.api.entity';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { E2E_CONFIG } from '../e2e.config';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import * as request from 'supertest';

import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { GivenUserExists } from '../steps/given-user-exists';
import { tagMaxlength } from '@marxan-api/modules/geo-feature-tags/dto/update-geo-feature-tag.dto';

export const getGeoFeatureTagsFixtures = async () => {
  const app = await bootstrapApplication();
  const userToken = await GivenUserIsLoggedIn(app, 'aa');
  const userId = await GivenUserExists(app, 'aa');

  const projectsRepo: Repository<Project> = app.get(
    getRepositoryToken(Project),
  );
  const usersProjectsApiRepo: Repository<UsersProjectsApiEntity> = app.get(
    getRepositoryToken(UsersProjectsApiEntity),
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
    GivenProject: async (projectName: string, roles?: ProjectRoles[]) => {
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
      const projectId = projectResult.data.id;

      if (roles) {
        await usersProjectsApiRepo.delete({ projectId });
        await usersProjectsApiRepo.save(
          roles.map((roleName) => ({
            projectId,
            userId,
            roleName,
          })),
        );
      }

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
        .patch(`/api/v1/projects/${projectId}/features/${featureId}/tags`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ tagName }),

    // ASSERT
    ThenEmptyErrorWasReturned: (response: request.Response) => {
      const error: any =
        response.body.errors[0].meta.rawError.response.message[0];
      expect(error).toContain(`The Tag cannot not be empty`);
    },
    ThenFeatureNotFoundWithinProjectErrorWasReturned: (
      response: request.Response,
      featureId: string,
      projectId: string,
    ) => {
      const error: any = response.body.errors[0].title;
      expect(error).toContain(
        `Feature with id ${featureId} is not available within Project with id ${projectId}`,
      );
    },
    ThenFeatureNotEditableWithinProjectErrorWasReturned: (
      response: request.Response,
      featureId: string,
      projectId: string,
    ) => {
      const error: any = response.body.errors[0].title;
      expect(error).toContain(
        `Feature with id ${featureId} is not editable by user ${userId} within Project with id ${projectId}`,
      );
    },

    ThenMaxLengthErrorWasReturned: (response: request.Response) => {
      const error: any =
        response.body.errors[0].meta.rawError.response.message[0];
      expect(error).toContain(
        `A tag should not be longer than ${tagMaxlength} characters`,
      );
    },

    ThenInvalidTagErrorWasReturned: (response: request.Response) => {
      const error: any =
        response.body.errors[0].meta.rawError.response.message[0];
      expect(error).toContain(`A tag cannot contain line breaks`);
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
    ThenFeatureDoesNotHaveTag: async (
      projectId: string,
      featureId: string,
      tag: string,
    ) => {
      const featureTags = await geoFeatureTagRepo.find({
        where: { projectId, featureId, tag },
      });
      expect(featureTags).toHaveLength(0);
    },
  };
};
