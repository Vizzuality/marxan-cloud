import { PromiseType } from 'utility-types';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { CostSurfaceTemplateController } from './cost-surface-template.controller';
import { ScenarioCostSurfaceTemplateService } from './scenario-cost-surface-template.service';
import { FakeCostTemplateService } from './__mocks__/fake-cost-template.service';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;
let app: INestApplication;

beforeEach(async () => {
  fixtures = await getFixtures();

  app = fixtures.getApp();
});

test(`should return a file when it is calculated`, async () => {
  // given
  fixtures.templateAvailable('123', 'sample shapefile');
  // when
  const test = request(app.getHttpServer()).get(
    '/api/v1/scenarios/123/cost-surface/shapefile-template',
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
    '/api/v1/scenarios/123/cost-surface/shapefile-template',
  );
  // then
  await test.expect(504);
});

const getFixtures = async () => {
  // not testing auth at the moment
  Reflect.deleteMetadata(GUARDS_METADATA, CostSurfaceTemplateController);
  const moduleFixture: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: ScenarioCostSurfaceTemplateService,
        useClass: FakeCostTemplateService,
      },
    ],
    controllers: [CostSurfaceTemplateController],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  const fakeShapefileService: FakeCostTemplateService = app.get(
    ScenarioCostSurfaceTemplateService,
  );

  const fixtures = {
    noRequestedTemplates() {
      fakeShapefileService.availableTemplatesForScenarios = {};
      fakeShapefileService.templatesInProgress = [];
    },
    getApp() {
      return app;
    },
    templateInProgress(scenarioId: string) {
      fakeShapefileService.templatesInProgress.push(scenarioId);
    },
    templateAvailable(scenarioId: string, fileContent: string) {
      fakeShapefileService.availableTemplatesForScenarios[
        scenarioId
      ] = fileContent;
    },
  };

  return fixtures;
};
