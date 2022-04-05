import { HttpStatus } from '@nestjs/common';
import { E2E_CONFIG } from './e2e.config';
import { TestClientApi } from './utils/test-client/test-client-api';

describe('ProjectsModule (e2e)', () => {
  let api: TestClientApi;

  beforeEach(async () => {
    api = await TestClientApi.initialize();
  });

  describe('when creating a project', () => {
    it('should fail when giving incomplete data', async () => {
      const userToken = await api.utils.createWorkingUser();

      await api.requests.projects
        .createProject(userToken, E2E_CONFIG.projects.invalid.incomplete())
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should succeed when giving minimum required data', async () => {
      const userToken = await api.utils.createWorkingUser();

      const {
        body: organizationResponse,
      } = await api.requests.organizations
        .createOrganization(userToken)
        .expect(HttpStatus.CREATED);
      const projectData = {
        ...E2E_CONFIG.projects.valid.minimal(),
        organizationId: organizationResponse.data.id,
      };
      const {
        body: projectResponse,
      } = await api.requests.projects
        .createProject(userToken, projectData)
        .expect(HttpStatus.CREATED);

      expect(projectResponse.data.type).toBe('projects');
    });

    it('should succeed when giving complete required data', async () => {
      const userToken = await api.utils.createWorkingUser();

      const organizationResponse = await api.requests.organizations
        .createOrganization(userToken)
        .expect(HttpStatus.CREATED);
      const projectData = {
        ...E2E_CONFIG.projects.valid.minimal(),
        organizationId: organizationResponse.body.data.id,
      };
      const projectResponse = await api.requests.projects
        .createProject(userToken, projectData)
        .expect(HttpStatus.CREATED);

      expect(projectResponse.body.data.type).toBe('projects');
      expect(projectResponse.body.meta.started).toBeTruthy();

      await api.utils.generateProjectBlmValues(projectResponse.body.data.id);
      const scenarioData = {
        ...E2E_CONFIG.scenarios.valid.minimal(),
        projectId: projectResponse.body.data.id,
      };

      await api.requests.scenarios
        .createScenario(userToken, scenarioData)
        .expect(HttpStatus.CREATED);
    });

    it('should fail when creating a project with regular PU shape but no PA id or GADM id', async () => {
      const userToken = await api.utils.createWorkingUser();

      const organizationResponse = await api.requests.organizations
        .createOrganization(userToken)
        .expect(HttpStatus.CREATED);
      const projectData = {
        ...E2E_CONFIG.projects.valid.minimal(),
        organizationId: organizationResponse.body.data.id,
      };
      const projectResponse = await api.requests.projects.createProject(
        userToken,
        {
          ...projectData,
          countryId: undefined,
          planningAreaId: undefined,
          adminAreaLevel1Id: undefined,
          adminAreaLevel2Id: undefined,
        },
      );

      expect(projectResponse.status).toBe(HttpStatus.BAD_REQUEST);
      expect(projectResponse.body.errors[0].status).toBe(
        HttpStatus.BAD_REQUEST,
      );
      expect(projectResponse.body.errors[0].title).toBe(
        'When a regular planning grid is requested (hexagon or square) either a custom planning area or a GADM area gid must be provided',
      );
    });
  });
  describe('when listing projects', () => {
    it('should be able to get a list of the projects the user have a role in', async () => {
      const userToken = await api.utils.createWorkingUser();
      const anotherUserToken = await api.utils.createWorkingUser({
        email: 'anotherEmail@gmail.com',
      });
      await api.utils.createWorkingProject(userToken);
      await api.utils.createWorkingProject(userToken);
      await api.utils.createWorkingProject(userToken);
      await api.utils.createWorkingProject(anotherUserToken);

      const { body: userProjects } = await api.requests.projects
        .listProjects(userToken)
        .expect(HttpStatus.OK);
      const {
        body: anotherUserProjects,
      } = await api.requests.projects
        .listProjects(anotherUserToken)
        .expect(HttpStatus.OK);

      expect(userProjects.data[0].type).toBe('projects');
      expect(userProjects.data).toHaveLength(3);
      expect(anotherUserProjects.data[0].type).toBe('projects');
      expect(anotherUserProjects.data).toHaveLength(1);
    });

    it('should return all user projects that has a field that matches the query param', async () => {
      const userToken = await api.utils.createWorkingUser();
      await api.utils.createWorkingProject(userToken, {
        ...E2E_CONFIG.projects.valid.minimal(),
        name: 'queryMe',
      });
      await api.utils.createWorkingProject(userToken, {
        ...E2E_CONFIG.projects.valid.minimal(),
        description: 'queryMe',
      });
      await api.utils.createWorkingProject(userToken, {
        ...E2E_CONFIG.projects.valid.minimal(),
        name: 'cannotBeFound',
        description: 'cannotBeFound',
      });

      const {
        body: projectsResponse,
      } = await api.requests.projects
        .listProjects(userToken)
        .expect(HttpStatus.OK);

      expect(projectsResponse.data[0].type).toBe('projects');
      expect(projectsResponse.data).toHaveLength(3);
    });

    it('should not include the relationships if they are not requested', async () => {
      const userToken = await api.utils.createWorkingUser();
      const { data } = await api.utils.createWorkingProject(userToken);
      await api.requests.scenarios.createScenario(userToken, {
        ...E2E_CONFIG.scenarios.valid.minimal(),
        projectId: data.id,
      });

      const { body: projectsResponse } = await api.requests.projects
        .listProjects(userToken, { include: [] }) // By default we won't include any relationship, but I think it is better to be explicit in this test
        .expect(HttpStatus.OK);

      expect(projectsResponse.data[0].relationships).toBeUndefined();
      expect(projectsResponse.included).toBeUndefined();
    });

    it('should include the relationships if they are requested', async () => {
      const userToken = await api.utils.createWorkingUser();
      await api.utils.createWorkingProjectWithScenario(userToken);

      const {
        body: projectsResponse,
      } = await api.requests.projects
        .listProjects(userToken, { include: ['scenarios'] })
        .expect(HttpStatus.OK);

      expect(projectsResponse.data[0].relationships).toBeDefined();
      expect(projectsResponse.included).toHaveLength(1);
    });
  });

  describe('when deleting a project', () => {
    it('should succeed with a project without scenario', async () => {
      const userToken = await api.utils.createWorkingUser();
      const { data } = await api.utils.createWorkingProject(userToken);

      await api.requests.projects
        .deleteProject(userToken, data.id)
        .expect(HttpStatus.OK);
      const {
        body: projectsResponse,
      } = await api.requests.projects
        .listProjects(userToken)
        .expect(HttpStatus.OK);

      expect(projectsResponse.data).toHaveLength(0);
    });

    it('should succeed with a project with scenarios', async () => {
      const userToken = await api.utils.createWorkingUser();
      const { data } = await api.utils.createWorkingProjectWithScenario(
        userToken,
      );

      await api.requests.projects
        .deleteProject(userToken, data.id)
        .expect(HttpStatus.OK);
      const {
        body: projectsResponse,
      } = await api.requests.projects
        .listProjects(userToken)
        .expect(HttpStatus.OK);

      expect(projectsResponse.data).toHaveLength(0);
    });

    it('should fail when trying to delete the project of another user', async () => {
      const userToken = await api.utils.createWorkingUser();
      const anotherUser = await api.utils.createWorkingUser({
        email: 'another@email.com',
      });
      const { data } = await api.utils.createWorkingProjectWithScenario(
        userToken,
      );

      await api.requests.projects
        .deleteProject(anotherUser, data.id)
        .expect(HttpStatus.FORBIDDEN);
      const {
        body: projectsResponse,
      } = await api.requests.projects
        .listProjects(userToken)
        .expect(HttpStatus.OK);

      expect(projectsResponse.data).toHaveLength(1);
    });
  });
});
