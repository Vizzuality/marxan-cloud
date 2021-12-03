import { PromiseType } from 'utility-types';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AllPlanningAreasService } from './all-planning-areas.service';
import { MultiplePlanningAreaIds } from './abstract-planning-areas.service';
import { getFixtures } from './__mocks__/all-planning-areas.service.fixtures';

jest.mock('config', () => ({
  get: (str: string) => `value_${str}`,
  has: () => true,
}));

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;
let planningAreaService: AllPlanningAreasService;

beforeEach(async () => {
  fixtures = await getFixtures();
  planningAreaService = fixtures.getService();
});

test(`getting id and name of planning area when id is unknown`, async () => {
  // given
  const ids = {
    unknownId: 'unknown',
  } as MultiplePlanningAreaIds;
  // when
  const result = await planningAreaService.getPlanningAreaIdAndName(ids);
  // then
  expect(result).toBeUndefined();
});

test(`getting bbox of planning area when id is unknown`, async () => {
  // given
  const ids = {
    unknownId: 'unknown',
  } as MultiplePlanningAreaIds;
  // when
  const result = await planningAreaService.getPlanningAreaBBox(ids);
  // then
  expect(result).toBeUndefined();
});

test(`locating entity of planning area when id is unknown`, async () => {
  // given
  const ids = {
    unknownId: 'unknown',
  } as MultiplePlanningAreaIds;
  // when
  const result = await planningAreaService.locatePlanningAreaEntity(ids);
  // then
  expect(result).toBeUndefined();
});

describe(`when custom, admin and country entities available`, () => {
  beforeEach(async () => {
    // given
    const planningAreaGeometryId = 'planningAreaGeometryId';
    fixtures.customPlanningAreaAvailable(planningAreaGeometryId);
    fixtures.adminAreaLvl1Available();
    fixtures.adminAreaLvl2Available();
    fixtures.countryAvailable();
  });

  test.each([
    [
      `with all ids`,
      () => ({
        ids: fixtures.ids.allIds,
        result: { planningAreaId: 'planningAreaGeometryId' },
      }),
    ],
    [
      `without planningAreaGeometryId`,
      () => ({
        ids: fixtures.ids.withoutPlanningAreaGeometryId,
        result: {
          planningAreaId: fixtures.adminAreaLvl2.gid2,
          planningAreaName: fixtures.adminAreaLvl2.name2,
        },
      }),
    ],
    [
      `without planningAreaGeometryId and adminAreaLevel2Id`,
      () => ({
        ids: fixtures.ids.withoutPlanningAreaGeometryIdAndAdminAreaLevel2Id,
        result: {
          planningAreaId: fixtures.adminAreaLvl1.gid1,
          planningAreaName: fixtures.adminAreaLvl1.name1,
        },
      }),
    ],
    [
      `with only countryId`,
      () => ({
        ids: fixtures.ids.withOnlyCountryId,
        result: {
          planningAreaId: fixtures.country1.gid0,
          planningAreaName: fixtures.country1.name0,
        },
      }),
    ],
  ])(`when getting id and name %s`, async (name, data) => {
    const { ids, result: expectedResult } = data();
    // when
    const result = await planningAreaService.getPlanningAreaIdAndName(ids);
    // then
    expect(result).toStrictEqual(expectedResult);
  });

  test.each([
    [
      `with all ids`,
      () => ({
        ids: fixtures.ids.allIds,
        result: { id: 'planningAreaGeometryId', tableName: 'planning_areas' },
      }),
    ],
    [
      `without planningAreaGeometryId`,
      () => ({
        ids: fixtures.ids.withoutPlanningAreaGeometryId,
        result: {
          id: fixtures.adminAreaLvl2.id,
          tableName: 'admin_regions',
        },
      }),
    ],
    [
      `without planningAreaGeometryId and adminAreaLevel2Id`,
      () => ({
        ids: fixtures.ids.withoutPlanningAreaGeometryIdAndAdminAreaLevel2Id,
        result: {
          id: fixtures.adminAreaLvl1.id,
          tableName: 'admin_regions',
        },
      }),
    ],
    [
      `with only countryId`,
      () => ({
        ids: fixtures.ids.withOnlyCountryId,
        result: {
          id: fixtures.country1.id,
          tableName: 'admin_regions',
        },
      }),
    ],
  ])(`locating planning area %s`, async (name, data) => {
    const { ids, result: expectedResult } = data();
    // when
    const result = await planningAreaService.locatePlanningAreaEntity(ids);
    // then
    expect(result).toStrictEqual(expectedResult);
  });

  test.each([
    [
      `with only planningAreaGeometryId`,
      () => ({
        ids: {
          planningAreaGeometryId: 'planningAreaGeometryId',
        },
        result: fixtures.customPlanningAreaBBox,
      }),
    ],
    [
      `without planningAreaGeometryId`,
      () => ({
        ids: fixtures.ids.withoutPlanningAreaGeometryId,
        result: fixtures.adminAreaLvl2.bbox,
      }),
    ],
    [
      `without planningAreaGeometryId and adminAreaLevel2Id`,
      () => ({
        ids: fixtures.ids.withoutPlanningAreaGeometryIdAndAdminAreaLevel2Id,
        result: fixtures.adminAreaLvl1.bbox,
      }),
    ],
    [
      `with only countryId`,
      () => ({
        ids: fixtures.ids.withOnlyCountryId,
        result: fixtures.country1.bbox,
      }),
    ],
  ])(`getting bbox %s`, async (name, data) => {
    const { ids, result: expectedResult } = data();
    // when
    const result = await planningAreaService.getPlanningAreaBBox(ids);
    // then
    expect(result).toStrictEqual(expectedResult);
  });
});

describe(`getting bbox when no entities available`, () => {
  test.each([
    [
      `with only planningAreaGeometryId`,
      () => ({
        ids: {
          planningAreaGeometryId: 'planningAreaGeometryId',
        },
      }),
    ],
    [
      `without planningAreaGeometryId`,
      () => ({
        ids: fixtures.ids.withoutPlanningAreaGeometryId,
      }),
    ],
    [
      `without planningAreaGeometryId and adminAreaLevel2Id`,
      () => ({
        ids: fixtures.ids.withoutPlanningAreaGeometryIdAndAdminAreaLevel2Id,
      }),
    ],
    [
      `with only countryId`,
      () => ({
        ids: fixtures.ids.withOnlyCountryId,
      }),
    ],
  ])(`%s`, async (name, data) => {
    const { ids } = data();
    // when
    const result = planningAreaService.getPlanningAreaBBox(ids);
    // then
    await expect(result).rejects.toStrictEqual(
      new NotFoundException(`There is no area relevant for given input.`),
    );
  });
});

test(`getting bbox with planningAreaGeometryId and admin area`, async () => {
  // given
  const ids = fixtures.ids.allIds;
  // and
  fixtures.customPlanningAreaAvailable('planningAreaGeometryId');
  // when
  const result = planningAreaService.getPlanningAreaBBox(ids);
  // then
  await expect(result).rejects.toStrictEqual(
    new BadRequestException('Resolved area does not match given levels.'),
  );
});

test(`getting bbox with admin area and level is mismatched`, async () => {
  // given
  const ids = {
    ...fixtures.ids.withoutPlanningAreaGeometryId,
    adminAreaLevel1Id: 'mismatched level',
  };
  // and
  fixtures.adminAreaLvl2Available();
  // when
  const result = planningAreaService.getPlanningAreaBBox(ids);
  // then
  await expect(result).rejects.toStrictEqual(
    new BadRequestException('Resolved area does not match given levels.'),
  );
});

describe(`getting id and name when no entities available`, () => {
  test.each([
    [
      `with all ids`,
      () => ({
        ids: fixtures.ids.allIds,
      }),
    ],
    [
      `without planningAreaGeometryId`,
      () => ({
        ids: fixtures.ids.withoutPlanningAreaGeometryId,
      }),
    ],
    [
      `without planningAreaGeometryId and adminAreaLevel2Id`,
      () => ({
        ids: fixtures.ids.withoutPlanningAreaGeometryIdAndAdminAreaLevel2Id,
      }),
    ],
    [
      `with only countryId`,
      () => ({
        ids: fixtures.ids.withOnlyCountryId,
      }),
    ],
  ])(`%s`, async (name, data) => {
    const { ids } = data();
    // when
    const result = planningAreaService.getPlanningAreaIdAndName(ids);
    // then
    await expect(result).rejects.toStrictEqual(
      new InternalServerErrorException(`Can not resolve planning area id`),
    );
  });
});

describe(`locating entity when no entities available`, () => {
  test.each([
    [
      `with all ids`,
      () => ({
        ids: fixtures.ids.allIds,
      }),
    ],
    [
      `without planningAreaGeometryId`,
      () => ({
        ids: fixtures.ids.withoutPlanningAreaGeometryId,
      }),
    ],
    [
      `without planningAreaGeometryId and adminAreaLevel2Id`,
      () => ({
        ids: fixtures.ids.withoutPlanningAreaGeometryIdAndAdminAreaLevel2Id,
      }),
    ],
    [
      `with only countryId`,
      () => ({
        ids: fixtures.ids.withOnlyCountryId,
      }),
    ],
  ])(`%s`, async (name, data) => {
    const { ids } = data();
    // when
    const result = planningAreaService.locatePlanningAreaEntity(ids);
    // then
    await expect(result).rejects.toStrictEqual(
      new InternalServerErrorException(`Can not resolve planning area id`),
    );
  });
});

describe(`when assigning project`, () => {
  test(`assigning custom planning area`, async () => {
    // given
    fixtures.customPlanningAreaAvailable('planningAreaGeometryId');
    // when
    await planningAreaService.assignProject({
      planningAreaGeometryId: 'planningAreaGeometryId',
      projectId: '1234',
    });
    // then
    fixtures.customPlanningAreaAssignedTo('planningAreaGeometryId', '1234');
  });

  test(`assigning not custom planning area`, async () => {
    // when
    const result = planningAreaService.assignProject({ projectId: '1234' });
    // then
    await expect(result).resolves.toBe(void 0);
  });
});
