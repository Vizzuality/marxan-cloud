import { PromiseType } from 'utility-types';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { FakeProjectTemplateService } from './__mocks__/fake-project-template.service';
import { ProjectTemplateService } from '@marxan-api/modules/projects/shapefile-template/project-template.service';
import { ProjectTemplateController } from '@marxan-api/modules/projects/shapefile-template/project-template.controller';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;
let app: INestApplication;

beforeEach(async () => {
  fixtures = await getFixtures();

  app = fixtures.getApp();
});

test(`cost surface template - should return a file when it is calculated`, async () => {
  // given
  fixtures.templateAvailable('123', 'sample shapefile');
  // when
  const test = request(app.getHttpServer()).get(
    '/api/v1/projects/123/cost-surfaces/shapefile-template',
  );
  // then
  const response = await test.expect(200);
  expect(response.text).toBe(`sample shapefile`);
  expect(response.headers['content-type']).toBe(`application/zip`);
});

test(`project shapefile template - should return a file when it is calculated`, async () => {
  // given
  fixtures.templateAvailable('123', 'sample shapefile');
  // when
  const test = request(app.getHttpServer()).get(
    '/api/v1/projects/123/project-grid/shapefile-template',
  );
  // then
  const response = await test.expect(200);
  expect(response.text).toBe(`sample shapefile`);
  expect(response.headers['content-type']).toBe(`application/zip`);
});

it(`should return a timeout when file is in progress`, async () => {
  // given
  fixtures.templateInProgress(`123`);
  // when
  const test = request(app.getHttpServer()).get(
    '/api/v1/projects/123/cost-surfaces/shapefile-template',
  );
  // then
  await test.expect(504);
});

const getFixtures = async () => {
  // not testing auth at the moment
  Reflect.deleteMetadata(GUARDS_METADATA, ProjectTemplateController);
  const moduleFixture: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: ProjectTemplateService,
        useClass: FakeProjectTemplateService,
      },
    ],
    controllers: [ProjectTemplateController],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  const fakeShapefileService: FakeProjectTemplateService = app.get(
    ProjectTemplateService,
  );

  const fixtures = {
    noRequestedTemplates() {
      fakeShapefileService.availableTemplatesForProject = {};
      fakeShapefileService.templatesInProgress = [];
    },
    getApp() {
      return app;
    },
    templateInProgress(projectId: string) {
      fakeShapefileService.templatesInProgress.push(projectId);
    },
    templateAvailable(projectId: string, fileContent: string) {
      fakeShapefileService.availableTemplatesForProject[
        projectId
      ] = fileContent;
    },
  };

  return fixtures;
};
