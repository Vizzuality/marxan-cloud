import { E2E_CONFIG } from './e2e.config';
import * as JSONAPISerializer from 'jsonapi-serializer';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { Organization } from '@marxan-api/modules/organizations/organization.api.entity';
import { tearDown } from '../test/utils/tear-down';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { createClient } from './test-client-api';
import { HttpStatus } from '@nestjs/common';

afterAll(async () => {
  await tearDown();
});

describe('ProjectsModule (e2e)', () => {
  let jwtToken: string;
  let contributorToken: string;
  let viewerToken: string;
  const Deserializer = new JSONAPISerializer.Deserializer({
    keyForAttribute: 'camelCase',
  });

  let anOrganization: Organization;
  let minimalProject: Project;
  let completeProject: Project;
  let aScenarioInACompleteProject: Scenario;

  // beforeAll(async () => {
  //   app = await bootstrapApplication();
  //   jwtToken = await GivenUserIsLoggedIn(app);
  //   contributorToken = await GivenUserIsLoggedIn(app, 'bb');
  //   viewerToken = await GivenUserIsLoggedIn(app, 'cc');
  // });

  describe('Projects', () => {
    it('should fail when a project with incomplete data', async () => {
      const client = await createClient();
      const { body } = await client.registerUser();

      await client
        .createProject(
          body.accessToken,
          E2E_CONFIG.projects.invalid.incomplete(),
        )
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should succeed when creating a project with minimum required data', async () => {
      const client = await createClient();
      const { body: registerResponse } = await client.registerUser();

      const { body: projectResponse } = await client
        .createProject(
          registerResponse.accessToken,
          E2E_CONFIG.projects.valid.minimal(),
        )
        .expect(HttpStatus.CREATED);

      expect(projectResponse.data.type).toBe('projects');
    });

    it('should succeed when creating a project with complete required data', async () => {
      const client = await createClient();
      const { body } = await client.registerUser();
      const jwt = body.accessToken;
      const { body: organizationResponse } = await client
        .createOrganization(jwt)
        .expect(HttpStatus.CREATED);
      const { body: projectResponse } = await client
        .createProject(jwt, {
          ...E2E_CONFIG.projects.valid.complete({ countryCode: 'NAM' }),
          organizationId: organizationResponse.id,
        })
        .expect(HttpStatus.CREATED);
      await client.generateProjectBlmValues(projectResponse.id);

      expect(projectResponse.data.type).toBe('projects');
      expect(projectResponse.meta.started).toBeTruthy();

      const { body: scenarioResponse } = await client
        .createScenario(jwt, {
          ...E2E_CONFIG.scenarios.valid.minimal(),
          projectId: projectResponse.id,
        })
        .expect(HttpStatus.CREATED);

      console.dir(scenarioResponse, { depth: Infinity });
    });

    //   test('A user with owner role on some projects should be able to get a list of the projects they have a role in', async () => {
    //     const response = await request(app.getHttpServer())
    //       .get('/api/v1/projects')
    //       .set('Authorization', `Bearer ${jwtToken}`)
    //       .expect(200);
    //
    //     const jsonAPIResponse: ProjectResultPlural = response.body;
    //
    //     expect(jsonAPIResponse.data[0].type).toBe('projects');
    //     expect(jsonAPIResponse.data).toHaveLength(4);
    //
    //     const projectNames: string[] = jsonAPIResponse.data.map(
    //       (p) => p.attributes.name,
    //     );
    //
    //     expect(projectNames.sort()).toEqual(
    //       [
    //         'Example Project 1 Org 1',
    //         'Example Project 2 Org 2',
    //         completeProject.name,
    //         minimalProject.name,
    //       ].sort(),
    //     );
    //   });
    //
    //   test('A user with contributor role on some projects should be able to get a list of the projects they have a role in', async () => {
    //     const response = await request(app.getHttpServer())
    //       .get('/api/v1/projects')
    //       .set('Authorization', `Bearer ${contributorToken}`)
    //       .expect(200);
    //
    //     const jsonAPIResponse: ProjectResultPlural = response.body;
    //
    //     expect(jsonAPIResponse.data[0].type).toBe('projects');
    //     expect(jsonAPIResponse.data).toHaveLength(2);
    //     const projectsNames: string[] = jsonAPIResponse.data.map(
    //       (p) => p.attributes.name,
    //     );
    //     expect(projectsNames.sort()).toEqual([
    //       'Example Project 1 Org 1',
    //       'Example Project 2 Org 2',
    //     ]);
    //   });
    //
    //   test('A user with viewer role on some projects should be able to get a list of the projects they have a role in', async () => {
    //     const response = await request(app.getHttpServer())
    //       .get('/api/v1/projects')
    //       .set('Authorization', `Bearer ${viewerToken}`)
    //       .expect(200);
    //
    //     const jsonAPIResponse: ProjectResultPlural = response.body;
    //
    //     expect(jsonAPIResponse.data[0].type).toBe('projects');
    //     expect(jsonAPIResponse.data).toHaveLength(2);
    //     const projectsNames: string[] = jsonAPIResponse.data.map(
    //       (p) => p.attributes.name,
    //     );
    //     expect(projectsNames.sort()).toEqual([
    //       'Example Project 1 Org 1',
    //       'Example Project 2 Org 2',
    //     ]);
    //   });
    //
    //   test('A user with owner role should be able to get a list of the projects with q param where they have a role in', async () => {
    //     const response = await request(app.getHttpServer())
    //       .get('/api/v1/projects?q=User')
    //       .set('Authorization', `Bearer ${jwtToken}`)
    //       .expect(200);
    //
    //     const jsonAPIResponse: ProjectResultPlural = response.body;
    //
    //     expect(jsonAPIResponse.data[0].type).toBe('projects');
    //     expect(jsonAPIResponse.data).toHaveLength(4);
    //
    //     const projectNames: string[] = jsonAPIResponse.data.map(
    //       (p) => p.attributes.name,
    //     );
    //
    //     expect(projectNames.sort()).toEqual(
    //       [
    //         'Example Project 1 Org 1',
    //         'Example Project 2 Org 2',
    //         completeProject.name,
    //         minimalProject.name,
    //       ].sort(),
    //     );
    //   });
    //
    //   test('A user should be get a list of projects without any included relationships if these have not been requested', async () => {
    //     const response = await request(app.getHttpServer())
    //       .get('/api/v1/projects')
    //       .set('Authorization', `Bearer ${jwtToken}`)
    //       .expect(200);
    //
    //     const jsonAPIResponse: ProjectResultPlural = response.body;
    //
    //     expect(jsonAPIResponse.data[0].type).toBe('projects');
    //
    //     const projectsWhichIncludeRelationships = jsonAPIResponse.data.filter(
    //       (i) => i.relationships,
    //     );
    //     expect(projectsWhichIncludeRelationships).toHaveLength(0);
    //   });
    //
    //   test('Deleting existing projects should succeed', async () => {
    //     const response1 = await request(app.getHttpServer())
    //       .delete(`/api/v1/projects/${minimalProject.id}`)
    //       .set('Authorization', `Bearer ${jwtToken}`)
    //       .expect(200);
    //
    //     expect(response1.body.data).toBeUndefined();
    //
    //     const response2 = await request(app.getHttpServer())
    //       .delete(`/api/v1/projects/${completeProject.id}`)
    //       .set('Authorization', `Bearer ${jwtToken}`)
    //       .expect(200);
    //
    //     expect(response2.body.data).toBeUndefined();
    //
    //     /**
    //      * Finally, we delete the organization we had created for these projects
    //      */
    //     await request(app.getHttpServer())
    //       .delete(`/api/v1/organizations/${anOrganization.id}`)
    //       .set('Authorization', `Bearer ${jwtToken}`)
    //       .expect(200);
    //   });
    // });
    //
    // test.skip('A user should be able to get a list of projects and related scenarios', async () => {
    //   const response = await request(app.getHttpServer())
    //     .get('/api/v1/projects?disablePagination=true&include=scenarios')
    //     .set('Authorization', `Bearer ${jwtToken}`)
    //     .expect(200);
    //
    //   const jsonAPIResponse: ProjectResultPlural = response.body;
    //   const allProjects: Project[] = await Deserializer.deserialize(
    //     response.body,
    //   );
    //
    //   expect(jsonAPIResponse.data[0].type).toBe('projects');
    //
    //   const aKnownProject: Project | undefined = allProjects.find(
    //     (i) => (i.id = completeProject.id),
    //   );
    //   expect(aKnownProject?.scenarios).toBeDefined();
    //   expect(
    //     aKnownProject?.scenarios?.find(
    //       (i) => i.id === aScenarioInACompleteProject.id,
    //     ),
    //   ).toBeDefined();
  });
});
