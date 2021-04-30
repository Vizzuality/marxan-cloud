import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { omit } from 'lodash';
import { E2E_CONFIG } from './e2e.config';
import { ProjectsTestUtils } from './utils/projects.test.utils';
import { Organization } from 'modules/organizations/organization.api.entity';
import { OrganizationsTestUtils } from './utils/organizations.test.utils';
import * as JSONAPISerializer from 'jsonapi-serializer';
import { Project } from 'modules/projects/project.api.entity';

describe('JSON API Specs (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let fakeCountry: string = 'ESP';
  let fakeOrganization: Organization;
  let fakeProject: Project;
  const Deserializer = new JSONAPISerializer.Deserializer({
    keyForAttribute: 'camelCase',
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    /**
     * Login User
     */

    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        username: E2E_CONFIG.users.basic.aa.username,
        password: E2E_CONFIG.users.basic.aa.password,
      })
      .expect(201);

    jwtToken = response.body.accessToken;

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
        countryCode: fakeCountry,
      }),
      organizationId: fakeOrganization.id,
    }).then(async (response) => await Deserializer.deserialize(response));
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  it('should return a response shaped as JSON:API Error spec, including ', async () => {
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
      .get('/api/v1/projects/fakeProject/features?q=fakeFeature')
      .set('Authorization', `Bearer ${jwtToken}`);

    response.body.errors.forEach((err: any) => {
      expect(Object.keys(jsonApiErrorResponse)).toEqual(
        expect.arrayContaining(Object.keys(err)),
      );
      /**
       * Should not include rawError and stack props in meta object if app is running on prod env
       */
      if (process.env.NODE_ENV !== 'development') {
        expect(Object.keys(err.meta)).toEqual(
          Object.keys(omit(jsonApiErrorResponse.meta, ['rawError', 'stack'])),
        );
      }
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test'
      ) {
        expect(Object.keys(err.meta)).toEqual(
          Object.keys(jsonApiErrorResponse.meta),
        );
      }
    });
  });

  it('should return a object with a "data" prop as a response to a POST request', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
          countryCode: fakeCountry,
        }),
        organizationId: fakeOrganization.id,
      });

    expect(typeof response.body).toBe('object');
    expect(Object.keys(response.body)).toHaveLength(1);
    expect(response.body.hasOwnProperty('data')).toBe(true);
    expect(typeof response.body.data).toBe('object');
  });
  it('should return a object with a "data" prop as a response to a PATCH request', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/projects/${fakeProject.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
          countryCode: fakeCountry,
        }),
        organizationId: fakeOrganization.id,
      });

    expect(typeof response.body).toBe('object');
    expect(Object.keys(response.body)).toHaveLength(1);
    expect(response.body.hasOwnProperty('data')).toBe(true);
    expect(typeof response.body.data).toBe('object');
  });

  it('should include pagination metadata as a paginated response', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/projects/${fakeProject.id}/features`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
          countryCode: fakeCountry,
        }),
        organizationId: fakeOrganization.id,
      });

    expect(response.body.hasOwnProperty('meta')).toBe(true);
    expect(Object.keys(response.body.meta)).toEqual([
      'totalItems',
      'totalPages',
      'size',
      'page',
    ]);
  });
});
