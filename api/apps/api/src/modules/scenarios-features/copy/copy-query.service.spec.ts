import { Test } from '@nestjs/testing';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CopyQuery } from './copy-query.service';

async function getFixtures() {
  const testingModule = await Test.createTestingModule({
    providers: [CopyQuery],
  }).compile();
  return {
    getQueryService() {
      return testingModule.get(CopyQuery);
    },
  };
}

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`returns full query with all parameters`, async () => {
  // given
  const service = fixtures.getQueryService();
  // when
  const query = service.prepareStatement(
    {
      scenarioId: 'scenario-id-1',
      specificationId: 'specification-id-1',
      input: {
        baseFeatureId: 'base-feature-id',
        target: 1.0,
        fpf: 0.2,
        prop: 0.3,
      },
    },
    { id: 'planning-area-id', tableName: 'planning_area_table' },
    ['wdpa1', 'wdpa2'],
    { bbox: [1, 2, 3, 4] },
  );
  // then
  expect(fixPrettierQuirk(query.query)).toEqual(`
      with inserted_sfp as (
        insert into scenario_features_preparation as sfp (feature_class_id,
                                                          scenario_id,
                                                          specification_id,
                                                          fpf,
                                                          target,
                                                          prop,
                                                          total_area,
                                                          current_pa,
                                                          hash)
          select fd.id,
                 $1,
                 $2,
                 $3,
                 $4,
                 $5,
                 coalesce(areas_cache.total_area, st_area(st_transform(st_intersection(pa.the_geom, fd.the_geom), 3410))),
                 coalesce(areas_cache.current_pa, st_area(st_transform(st_intersection(st_intersection(pa.the_geom, fd.the_geom), (
                 select st_union(wdpa.the_geom) as area
                 from wdpa where st_intersects(st_makeenvelope(
                  $6,
                  $8,
                  $7,
                  $9,
                  4326
                ), wdpa.the_geom) and wdpa.id in ($10::uuid, $11::uuid)
            )),3410))),
                 md5hash
          from features_data as fd
          left join planning_area_table as pa on pa.id = $12

        cross join md5(
            row (
                pa.id, fd.id,
                $6::double precision,
                $8::double precision,
                $7::double precision,
                $9::double precision
                ,$10::uuid, $11::uuid)::text
            ) as md5hash

          left join areas_cache on areas_cache.hash = md5hash
          where feature_id = $13
          and st_intersects(st_makeenvelope(
          $6,
          $8,
          $7,
          $9, 4326), fd.the_geom)
          returning sfp.id as id, sfp.hash as hash, sfp.total_area as total_area, sfp.current_pa as current_pa
      ), inserted_cache as (
          insert into areas_cache (hash, total_area, current_pa)
          select hash, total_area, current_pa from inserted_sfp
          on conflict do nothing
      )
      select id from inserted_sfp
`);
  // and
  expect(query.parameters).toEqual([
    'scenario-id-1',
    'specification-id-1',
    0.2,
    1,
    0.3,
    1,
    2,
    3,
    4,
    'wdpa1',
    'wdpa2',
    'planning-area-id',
    'base-feature-id',
  ]);
});

test(`returns full query with no wdpa`, async () => {
  // given
  const service = fixtures.getQueryService();
  // when
  const query = service.prepareStatement(
    {
      scenarioId: 'scenario-id-1',
      specificationId: 'specification-id-1',
      input: {
        baseFeatureId: 'base-feature-id',
        target: 1.0,
        fpf: 0.2,
        prop: 0.3,
      },
    },
    { id: 'planning-area-id', tableName: 'planning_area_table' },
    [],
    { bbox: [1, 2, 3, 4] },
  );
  // then
  expect(fixPrettierQuirk(query.query)).toEqual(
    `
      with inserted_sfp as (
        insert into scenario_features_preparation as sfp (feature_class_id,
                                                          scenario_id,
                                                          specification_id,
                                                          fpf,
                                                          target,
                                                          prop,
                                                          total_area,
                                                          current_pa,
                                                          hash)
          select fd.id,
                 $1,
                 $2,
                 $3,
                 $4,
                 $5,
                 coalesce(areas_cache.total_area, st_area(st_transform(st_intersection(pa.the_geom, fd.the_geom), 3410))),
                 coalesce(areas_cache.current_pa, NULL),
                 md5hash
          from features_data as fd
          left join planning_area_table as pa on pa.id = $6

        cross join md5(
            row (
                pa.id, fd.id,
                $7::double precision,
                $9::double precision,
                $8::double precision,
                $10::double precision
                )::text
            ) as md5hash

          left join areas_cache on areas_cache.hash = md5hash
          where feature_id = $11
          and st_intersects(st_makeenvelope(
          $7,
          $9,
          $8,
          $10, 4326), fd.the_geom)
          returning sfp.id as id, sfp.hash as hash, sfp.total_area as total_area, sfp.current_pa as current_pa
      ), inserted_cache as (
          insert into areas_cache (hash, total_area, current_pa)
          select hash, total_area, current_pa from inserted_sfp
          on conflict do nothing
      )
      select id from inserted_sfp
`,
  );
  // and
  expect(query.parameters).toMatchInlineSnapshot(
    [
      'scenario-id-1',
      'specification-id-1',
      0.2,
      1,
      0.3,
      'planning-area-id',
      1,
      2,
      3,
      4,
      'base-feature-id',
    ],
    `
    Array [
      "scenario-id-1",
      "specification-id-1",
      0.2,
      1,
      0.3,
      "planning-area-id",
      1,
      2,
      3,
      4,
      "base-feature-id",
    ]
  `,
  );
});

test(`returns full query with no planning area location`, async () => {
  // given
  const service = fixtures.getQueryService();
  // when
  const query = service.prepareStatement(
    {
      scenarioId: 'scenario-id-1',
      specificationId: 'specification-id-1',
      input: {
        baseFeatureId: 'base-feature-id',
        target: 1.0,
        fpf: 0.2,
        prop: 0.3,
      },
    },
    undefined,
    ['wdpa1', 'wdpa2'],
    { bbox: [1, 2, 3, 4] },
  );
  // then
  expect(fixPrettierQuirk(query.query)).toEqual(
    `
      with inserted_sfp as (
        insert into scenario_features_preparation as sfp (feature_class_id,
                                                          scenario_id,
                                                          specification_id,
                                                          fpf,
                                                          target,
                                                          prop,
                                                          total_area,
                                                          current_pa,
                                                          hash)
          select fd.id,
                 $1,
                 $2,
                 $3,
                 $4,
                 $5,
                 coalesce(areas_cache.total_area, NULL),
                 coalesce(areas_cache.current_pa, st_area(st_transform(st_intersection(st_intersection(pa.the_geom, fd.the_geom), (
                 select st_union(wdpa.the_geom) as area
                 from wdpa where st_intersects(st_makeenvelope(
                  $6,
                  $8,
                  $7,
                  $9,
                  4326
                ), wdpa.the_geom) and wdpa.id in ($10::uuid, $11::uuid)
            )),3410))),
                 md5hash
          from features_data as fd


        cross join md5(
            row (
                 fd.id,
                $6::double precision,
                $8::double precision,
                $7::double precision,
                $9::double precision
                ,$10::uuid, $11::uuid)::text
            ) as md5hash

          left join areas_cache on areas_cache.hash = md5hash
          where feature_id = $12
          and st_intersects(st_makeenvelope(
          $6,
          $8,
          $7,
          $9, 4326), fd.the_geom)
          returning sfp.id as id, sfp.hash as hash, sfp.total_area as total_area, sfp.current_pa as current_pa
      ), inserted_cache as (
          insert into areas_cache (hash, total_area, current_pa)
          select hash, total_area, current_pa from inserted_sfp
          on conflict do nothing
      )
      select id from inserted_sfp
`,
  );
  // and
  expect(query.parameters).toEqual([
    'scenario-id-1',
    'specification-id-1',
    0.2,
    1,
    0.3,
    1,
    2,
    3,
    4,
    'wdpa1',
    'wdpa2',
    'base-feature-id',
  ]);
});

function fixPrettierQuirk(query: string) {
  return query.replace(/ +$/gm, '');
}
