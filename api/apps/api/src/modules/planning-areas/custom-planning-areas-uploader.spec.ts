import * as nock from 'nock';
import { isEqual } from 'lodash';
import { PromiseType } from 'utility-types';
import { Either, left, right } from 'fp-ts/Either';
import { Test } from '@nestjs/testing';
import { HttpModule } from '@nestjs/common';
import {
  geoprocessingUrlToken,
  CustomPlanningAreasUploader,
  validationFailed,
} from './custom-planning-areas-uploader.service';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;
let uploader: CustomPlanningAreasUploader;

beforeEach(async () => {
  fixtures = await getFixtures();
  uploader = fixtures.getUploader();
});

afterEach(async () => {
  await fixtures.cleanup();
});

describe(`when file validated successfully`, () => {
  let result: Either<typeof validationFailed, any>;
  beforeEach(async () => {
    // given
    fixtures.fileValidatedSuccessfully();

    // when
    result = await uploader.savePlanningAreaFromShapefile(fixtures.aFile);
  });

  // then
  it(`should pass the response`, () => {
    expect(result).toEqual(right(fixtures.validResponse));
  });
});

describe(`when file validation failed`, () => {
  let result: Either<typeof validationFailed, any>;
  beforeEach(async () => {
    // given
    fixtures.fileValidationFailed();

    // when
    result = await uploader.savePlanningAreaFromShapefile(fixtures.aFile);
  });

  // then
  it(`should return validation failed`, () => {
    expect(result).toStrictEqual(left(validationFailed));
  });
});

describe(`when underlying service failed`, () => {
  let result: Promise<Either<typeof validationFailed, any>>;
  beforeEach(async () => {
    // given
    fixtures.failedResponse();

    // when
    result = uploader.savePlanningAreaFromShapefile(fixtures.aFile);
  });

  // then
  it(`should throw`, async () => {
    await expect(result).rejects.toMatchInlineSnapshot(
      `[Error: Request failed with status code 500]`,
    );
  });
});

async function getFixtures() {
  const geoprocessingUrl = `https://geoprocessing.test`;
  const testingModule = await Test.createTestingModule({
    imports: [HttpModule],
    providers: [
      {
        provide: geoprocessingUrlToken,
        useValue: geoprocessingUrl,
      },
      CustomPlanningAreasUploader,
    ],
  }).compile();

  nock.disableNetConnect();
  const scope = nock(`https://geoprocessing.test`);

  const fixtures = {
    aFile: {
      fieldname: 'fake multer object',
    } as Express.Multer.File,
    validResponse: { success: true },
    getUploader: () => testingModule.get(CustomPlanningAreasUploader),
    fileValidatedSuccessfully() {
      scope
        .post(`/api/v1/projects/planning-area/shapefile`, (body) =>
          isEqual(body, fixtures.aFile),
        )
        .reply(200, fixtures.validResponse);
    },
    fileValidationFailed() {
      scope
        .post(`/api/v1/projects/planning-area/shapefile`, (body) =>
          isEqual(body, fixtures.aFile),
        )
        .reply(400, 'invalid');
    },
    failedResponse() {
      scope
        .post(`/api/v1/projects/planning-area/shapefile`, (body) =>
          isEqual(body, fixtures.aFile),
        )
        .reply(500, 'failed');
    },
    cleanup() {
      nock.enableNetConnect();
    },
  };
  return fixtures;
}
