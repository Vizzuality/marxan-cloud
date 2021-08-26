import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { Repository } from 'typeorm';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const token = await GivenUserIsLoggedIn(app);
  const org = await OrganizationsTestUtils.createOrganization(app, token, {
    name: `User Organization ${Date.now()}`,
  });
  const projectsRepo: Repository<Project> = app.get(
    getRepositoryToken(Project),
  );

  const createProject = async (authToken = token) => {
    const project = (
      await ProjectsTestUtils.createProject(app, authToken, {
        name: `User Project ${Date.now()}`,
        organizationId: org.data.id,
      })
    ).data.id;
    return project;
  };

  return {
    cleanup: async () => {
      await projectsRepo.delete({
        organizationId: org.data.id,
      });
      await OrganizationsTestUtils.deleteOrganization(app, token, org.data.id);
      await app.close();
    },
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
