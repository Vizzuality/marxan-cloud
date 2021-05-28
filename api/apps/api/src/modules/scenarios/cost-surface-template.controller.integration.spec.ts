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

describe(`given a template cost file was never requested`, () => {
  beforeEach(() => {
    // given
    fixtures.noRequestedTemplates();
  });

  describe(`when requesting a file for scenario 123`, () => {
    let test: request.Test;
    beforeEach(async () => {
      // when
      test = request(app.getHttpServer()).get(
        '/api/v1/scenarios/123/cost-surface/shapefile-template',
      );
    });

    // then
    it(`should schedule creation`, async () => {
      await test;
      fixtures.expectScheduled(['123']);
    });

    it(`should return accepted status`, async () => {
      await test.expect(202);
    });
  });
});

describe(`given a template file is being prepared for scenario 123`, () => {
  beforeEach(() => {
    // given
    fixtures.templateInProgress('123');
  });

  describe(`when requesting a file for scenario 123`, () => {
    let test: request.Test;
    beforeEach(() => {
      // when
      test = request(app.getHttpServer()).get(
        '/api/v1/scenarios/123/cost-surface/shapefile-template',
      );
    });

    // then
    it(`should not start a creating process`, async () => {
      await test;
      fixtures.expectScheduled([]);
    });

    it(`should return accepted status`, async () => {
      await test.expect(202);
    });
  });
});

describe(`given a template file is available for scenario 123`, () => {
  beforeEach(() => {
    // given
    fixtures.templateAvailable('123', 'sample shapefile');
  });
  describe(`when requesting a file for scenario 123`, () => {
    let test: request.Test;
    beforeEach(() => {
      // when
      test = request(app.getHttpServer()).get(
        '/api/v1/scenarios/123/cost-surface/shapefile-template',
      );
    });

    // then
    it(`should not schedule creation`, async () => {
      await test;
      fixtures.expectScheduled([]);
    });

    it(`should return ok status and stream the file`, async () => {
      const response = await test.expect(200);
      expect(response.text).toBe(`sample shapefile`);
      expect(response.headers['content-type']).toBe(`application/zip`);
    });
  });
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
      fakeShapefileService.scheduledTemplateCreation = [];
    },
    getApp() {
      return app;
    },
    expectScheduled(scenarioId: string[]) {
      expect(fakeShapefileService.scheduledTemplateCreation).toStrictEqual(
        scenarioId,
      );
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
