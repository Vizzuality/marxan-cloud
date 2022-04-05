import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { omit } from 'lodash';
import { E2E_CONFIG } from './e2e.config';
import { ProjectsTestUtils } from './utils/projects.test.utils';
import { Organization } from '@marxan-api/modules/organizations/organization.api.entity';
import { OrganizationsTestUtils } from './utils/organizations.test.utils';
import * as JSONAPISerializer from 'jsonapi-serializer';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { tearDown } from './utils/tear-down';
import { bootstrapApplication } from './utils/api-application';
import { GivenUserIsLoggedIn } from './steps/given-user-is-logged-in';

afterAll(async () => {
  await tearDown();
});

describe('JSON API Specs (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let fakeOrganization: Organization;
  let fakeProject: Project;

  const Deserializer = new JSONAPISerializer.Deserializer({
    keyForAttribute: 'camelCase',
  });

  beforeAll(async () => {
    app = await bootstrapApplication();
    jwtToken = await GivenUserIsLoggedIn(app);

    /**
     * Create Scenario
     */

    fakeOrganization = await OrganizationsTestUtils.createOrganization(
      app,
      jwtToken,
      E2E_CONFIG.organizations.valid.minimal(),
    ).then(async (response) => await Deserializer.deserialize(response));

    fakeProject = await ProjectsTestUtils.createProject(app, jwtToken, {
      ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
        countryId: 'NAM',
        adminAreaLevel1Id: 'NAM.12_1',
        adminAreaLevel2Id: 'NAM.12.7_1',
      }),
      organizationId: fakeOrganization.id,
    }).then(async (response) => await Deserializer.deserialize(response));
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  it('should return a response shaped as JSON:API Error spec, including raw error data', async () => {
    const jsonApiErrorResponse = {
      id: null,
      links: null,
      status: null,
      code: null,
      source: null,
      title: null,
      meta: {
        timestamp: null,
        path: null,
        type: null,
        rawError: null,
        stack: null,
      },
    };

    const response = await request(app.getHttpServer())
      .get(
        `/api/v1/projects/invalidProjectIdToTriggerAnError/features?q=fakeFeature`,
      )
      .set('Authorization', `Bearer ${jwtToken}`);

    response.body.errors.forEach((err: any) => {
      expect(Object.keys(jsonApiErrorResponse)).toEqual(
        expect.arrayContaining(Object.keys(err)),
      );
      /**
       * Should not include rawError and stack props in meta object if app is running on prod env
       */
      // Debt: this test isn't reliable and should be refactored (ideally to out of e2e scope)
      if (
        process.env.NODE_ENV !== 'development' &&
        process.env.NODE_ENV !== 'test'
      ) {
        expect(Object.keys(err.meta)).toEqual(
          Object.keys(omit(jsonApiErrorResponse.meta, ['rawError', 'stack'])),
        );
      } else {
        expect(Object.keys(err.meta)).toEqual(
          Object.keys(jsonApiErrorResponse.meta),
        );
      }
    });
  });

  it('should include pagination metadata as a paginated response', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/projects/${fakeProject.id}/features`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
          countryId: 'NAM',
          adminAreaLevel1Id: 'NAM.12_1',
          adminAreaLevel2Id: 'NAM.12.7_1',
        }),
        organizationId: fakeOrganization.id,
      });

    expect(response.body).toMatchObject({
      meta: {
        totalItems: expect.any(Number),
        totalPages: expect.any(Number),
        size: expect.any(Number),
        page: expect.any(Number),
      },
    });
  });
});
