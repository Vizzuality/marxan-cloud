import { createClient } from './test-client-api';
import { HttpStatus } from '@nestjs/common';
import { E2E_CONFIG } from '../test/e2e.config';

describe('ProjectsModule (e2e)', () => {
  describe('when creating a project', () => {
    it('should fail when a project with incomplete data', async () => {
      const client = await createClient();
      const userToken = await client.utils.createWorkingUser();

      await client
        .createProject(userToken, E2E_CONFIG.projects.invalid.incomplete())
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should succeed when creating a project with minimum required data', async () => {
      const client = await createClient();
      const userToken = await client.utils.createWorkingUser();

      const { body: organizationResponse } = await client
        .createOrganization(userToken)
        .expect(HttpStatus.CREATED);
      const projectData = {
        ...E2E_CONFIG.projects.valid.minimal(),
        organizationId: organizationResponse.data.id,
      };
      const { body: projectResponse } = await client
        .createProject(userToken, projectData)
        .expect(HttpStatus.CREATED);

      expect(projectResponse.data.type).toBe('projects');
    });

    it('should succeed when creating a project with complete required data', async () => {
      const client = await createClient();
      const userToken = await client.utils.createWorkingUser();

      const { body: organizationResponse } = await client
        .createOrganization(userToken)
        .expect(HttpStatus.CREATED);
      const projectData = {
        ...E2E_CONFIG.projects.valid.minimal(),
        organizationId: organizationResponse.data.id,
      };
      const { body: projectResponse } = await client
        .createProject(userToken, projectData)
        .expect(HttpStatus.CREATED);

      expect(projectResponse.data.type).toBe('projects');
      expect(projectResponse.meta.started).toBeTruthy();

      await client.utils.generateProjectBlmValues(projectResponse.data.id);
      const scenarioData = {
        ...E2E_CONFIG.scenarios.valid.minimal(),
        projectId: projectResponse.data.id,
      };

      await client
        .createScenario(userToken, scenarioData)
        .expect(HttpStatus.CREATED);
    });
  });

  describe('when listing projects', () => {
    it('should be able to get a list of the projects the user have a role in', async () => {
      const client = await createClient();
      const userToken = await client.utils.createWorkingUser();
      const anotherUserToken = await client.utils.createWorkingUser({
        email: 'anotherEmail@gmail.com',
      });
      await client.utils.createWorkingProject(userToken);
      await client.utils.createWorkingProject(userToken);
      await client.utils.createWorkingProject(userToken);
      await client.utils.createWorkingProject(anotherUserToken);

      const { body: userProjects } = await client
        .listProjects(userToken)
        .expect(HttpStatus.OK);
      const { body: anotherUserProjects } = await client
        .listProjects(anotherUserToken)
        .expect(HttpStatus.OK);

      expect(userProjects.data[0].type).toBe('projects');
      expect(userProjects.data).toHaveLength(3);
      expect(anotherUserProjects.data[0].type).toBe('projects');
      expect(anotherUserProjects.data).toHaveLength(1);
    });

    it('should return all user projects that has a field that matches the query param', async () => {
      const client = await createClient();
      const userToken = await client.utils.createWorkingUser();
      await client.utils.createWorkingProject(userToken, {
        ...E2E_CONFIG.projects.valid.minimal(),
        name: 'queryMe',
      });
      await client.utils.createWorkingProject(userToken, {
        ...E2E_CONFIG.projects.valid.minimal(),
        description: 'queryMe',
      });
      await client.utils.createWorkingProject(userToken, {
        ...E2E_CONFIG.projects.valid.minimal(),
        name: 'cannotBeFound',
        description: 'cannotBeFound',
      });

      const { body: projectsResponse } = await client
        .listProjects(userToken)
        .expect(HttpStatus.OK);

      expect(projectsResponse.data[0].type).toBe('projects');
      expect(projectsResponse.data).toHaveLength(3);
    });

    it('should not include the relationships if they are not requested', async () => {
      const client = await createClient();
      const userToken = await client.utils.createWorkingUser();
      const { data } = await client.utils.createWorkingProject(userToken);
      await client.createScenario(userToken, {
        ...E2E_CONFIG.scenarios.valid.minimal(),
        projectId: data.id,
      });

      const { body: projectsResponse } = await client
        .listProjects(userToken, { include: [] }) // By default we won't include any relationship, but I think it is better to be explicit in this test
        .expect(HttpStatus.OK);

      expect(projectsResponse.data[0].relationships).toBeUndefined();
      expect(projectsResponse.included).toBeUndefined();
    });

    it('should include the relationships if they are requested', async () => {
      const client = await createClient();
      const userToken = await client.utils.createWorkingUser();
      await client.utils.createWorkingProjectWithScenario(userToken);

      const { body: projectsResponse } = await client
        .listProjects(userToken, { include: ['scenarios'] })
        .expect(HttpStatus.OK);

      expect(projectsResponse.data[0].relationships).toBeDefined();
      expect(projectsResponse.included).toHaveLength(1);
    });
  });

  describe('when deleting a project', () => {
    it('should succeed with a project without scenario', async () => {
      const client = await createClient();
      const userToken = await client.utils.createWorkingUser();
      const { data } = await client.utils.createWorkingProject(userToken);

      await client.deleteProject(userToken, data.id).expect(HttpStatus.OK);
      const { body: projectsResponse } = await client
        .listProjects(userToken)
        .expect(HttpStatus.OK);

      expect(projectsResponse.data).toHaveLength(0);
    });

    it('should succeed with a project with scenarios', async () => {
      const client = await createClient();
      const userToken = await client.utils.createWorkingUser();
      const { data } = await client.utils.createWorkingProjectWithScenario(
        userToken,
      );

      await client.deleteProject(userToken, data.id).expect(HttpStatus.OK);
      const { body: projectsResponse } = await client
        .listProjects(userToken)
        .expect(HttpStatus.OK);

      expect(projectsResponse.data).toHaveLength(0);
    });

    it('should fail when trying to delete another user project', async () => {
      const client = await createClient();
      const userToken = await client.utils.createWorkingUser();
      const anotherUser = await client.utils.createWorkingUser({
        email: 'another@email.com',
      });
      const { data } = await client.utils.createWorkingProjectWithScenario(
        userToken,
      );

      await client
        .deleteProject(anotherUser, data.id)
        .expect(HttpStatus.FORBIDDEN);
      const { body: projectsResponse } = await client
        .listProjects(userToken)
        .expect(HttpStatus.OK);

      expect(projectsResponse.data).toHaveLength(1);
    });
  });
});
