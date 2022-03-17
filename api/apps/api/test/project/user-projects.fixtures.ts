import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import * as request from 'supertest';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const token = await GivenUserIsLoggedIn(app);
  const org = await OrganizationsTestUtils.createOrganization(app, token, {
    name: `User Organization ${Date.now()}`,
  });

  const createProject = async (authToken = token) => {
    return (
      await ProjectsTestUtils.createProject(app, authToken, {
        name: `User Project ${Date.now()}`,
        organizationId: org.data.id,
      })
    ).data.id;
  };

  return {
    WhenGettingUserProjects: async () =>
      request(app.getHttpServer())
        .get(`/api/v1/projects?disablePagination=true`)
        .set('Authorization', `Bearer ${token}`),
    GivenAnotherUserCreatedAProject: async () => {
      const anotherUserToken = await GivenUserIsLoggedIn(app, `bb`);
      return createProject(anotherUserToken);
    },
    GivenUserCreatedAProject: createProject,
    ThenOnlyUserCreatedArePresent: (
      owned: string,
      someonesElse: string,
      allProjects: request.Response,
    ) => {
      const userProjects: string[] = allProjects.body.data.map(
        (p: any) => p.id,
      );
      expect(userProjects.includes(owned)).toBeTruthy();
      expect(userProjects.includes(someonesElse)).toBeFalsy();
    },
  };
};
