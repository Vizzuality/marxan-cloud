import { Test } from '@nestjs/testing';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CopyQuery } from './copy-query.service';
import { SpecificationOperation } from '@marxan/specification';

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
        baseFeatureId: 'input-base-feature-id',
        target: 1.0,
        fpf: 0.2,
        prop: 0.3,
      },
    },
    { id: 'planning-area-id', tableName: 'planning_area_table' },
    ['wdpa1', 'wdpa2'],
    { bbox: [1, 2, 3, 4] },
    {
      baseFeatureId: 'parent-feature-id',
      operation: SpecificationOperation.Split,
      splitByProperty: 'key 1',
      value: 'random value',
    },
  );
  // then
  expect(fixPrettierQuirk(query.query)).toEqual(`
      with inserted_sfp as (
        insert into scenario_features_preparation as sfp (feature_class_id,
                                                          api_feature_id,
                                                          scenario_id,
                                                          specification_id,
                                                          fpf,
                                                          target,
                                                          prop,
                                                          total_area,
                                                          current_pa,
                                                          hash)
          select fd.id,
                 $3,
                 $4,
                 $5,
                 $6,
                 $7,
                 $8,
                 coalesce(areas_cache.total_area, st_area(st_transform(st_intersection(pa.the_geom, fd.the_geom), 3410))),
                 coalesce(areas_cache.current_pa, st_area(st_transform(st_intersection(st_intersection(pa.the_geom, fd.the_geom), (
                 select st_union(wdpa.the_geom) as area
                 from wdpa where st_intersects(st_makeenvelope(
                  $9,
                  $11,
                  $10,
                  $12,
                  4326
                ), wdpa.the_geom) and wdpa.id in ($13::uuid, $14::uuid)
            )),3410))),
                 md5hash
          from features_data as fd
          inner join (
            SELECT DISTINCT feature_data_id
            FROM feature_properties_kv fpkv
            WHERE feature_id = $1
            and fpkv.key = $2
            and trim('"' FROM fpkv.value::text) = trim('"' FROM $15::text)
            ) sfpkv
            ON sfpkv.feature_data_id = fd.id
          left join planning_area_table as pa on pa.id = $16

        cross join md5(
                pa.hash || '|' || fd.id || '|' ||
                $9::double precision || '|' ||
                $11::double precision || '|' ||
                $10::double precision || '|' ||
                $12::double precision
                || '|' ||$13::text ||  $14::text
            ) as md5hash

          left join areas_cache on areas_cache.hash = md5hash
          where feature_id = $1
          and st_intersects(st_makeenvelope(
          $9,
          $11,
          $10,
          $12, 4326), fd.the_geom)
          returning sfp.id as id, sfp.hash as hash, sfp.total_area as total_area, sfp.current_pa as current_pa
      ), inserted_cache as (
          insert into areas_cache (hash, total_area, current_pa)
          select hash, total_area, current_pa from inserted_sfp
          on conflict do nothing
      )
      select id from inserted_sfp`);
  // and
  expect(query.parameters).toEqual([
    'parent-feature-id',
    'key 1',
    'input-base-feature-id',
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
    'random value',
    'planning-area-id',
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
        baseFeatureId: 'input-base-feature-id',
        target: 1.0,
        fpf: 0.2,
        prop: 0.3,
      },
    },
    { id: 'planning-area-id', tableName: 'planning_area_table' },
    [],
    { bbox: [1, 2, 3, 4] },
    {
      baseFeatureId: 'parent-feature-id',
      operation: SpecificationOperation.Split,
      splitByProperty: 'key 1',
      value: 'random value',
    },
  );
  // then
  expect(fixPrettierQuirk(query.query)).toEqual(
    `
      with inserted_sfp as (
        insert into scenario_features_preparation as sfp (feature_class_id,
                                                          api_feature_id,
                                                          scenario_id,
                                                          specification_id,
                                                          fpf,
                                                          target,
                                                          prop,
                                                          total_area,
                                                          current_pa,
                                                          hash)
          select fd.id,
                 $3,
                 $4,
                 $5,
                 $6,
                 $7,
                 $8,
                 coalesce(areas_cache.total_area, st_area(st_transform(st_intersection(pa.the_geom, fd.the_geom), 3410))),
                 coalesce(areas_cache.current_pa, NULL),
                 md5hash
          from features_data as fd
          inner join (
            SELECT DISTINCT feature_data_id
            FROM feature_properties_kv fpkv
            WHERE feature_id = $1
            and fpkv.key = $2
            and trim('"' FROM fpkv.value::text) = trim('"' FROM $9::text)
            ) sfpkv
            ON sfpkv.feature_data_id = fd.id
          left join planning_area_table as pa on pa.id = $10

        cross join md5(
                pa.hash || '|' || fd.id || '|' ||
                $11::double precision || '|' ||
                $13::double precision || '|' ||
                $12::double precision || '|' ||
                $14::double precision

            ) as md5hash

          left join areas_cache on areas_cache.hash = md5hash
          where feature_id = $1
          and st_intersects(st_makeenvelope(
          $11,
          $13,
          $12,
          $14, 4326), fd.the_geom)
          returning sfp.id as id, sfp.hash as hash, sfp.total_area as total_area, sfp.current_pa as current_pa
      ), inserted_cache as (
          insert into areas_cache (hash, total_area, current_pa)
          select hash, total_area, current_pa from inserted_sfp
          on conflict do nothing
      )
      select id from inserted_sfp`,
  );
  // and
  expect(query.parameters).toMatchInlineSnapshot(
    `
    Array [
      "parent-feature-id",
      "key 1",
      "input-base-feature-id",
      "scenario-id-1",
      "specification-id-1",
      0.2,
      1,
      0.3,
      "random value",
      "planning-area-id",
      1,
      2,
      3,
      4,
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
        baseFeatureId: 'input-base-feature-id',
        target: 1.0,
        fpf: 0.2,
        prop: 0.3,
      },
    },
    undefined,
    ['wdpa1', 'wdpa2'],
    { bbox: [1, 2, 3, 4] },
    {
      baseFeatureId: 'parent-feature-id',
      operation: SpecificationOperation.Split,
      splitByProperty: 'key 1',
      value: 'random value',
    },
  );
  // then
  expect(fixPrettierQuirk(query.query)).toEqual(
    `
      with inserted_sfp as (
        insert into scenario_features_preparation as sfp (feature_class_id,
                                                          api_feature_id,
                                                          scenario_id,
                                                          specification_id,
                                                          fpf,
                                                          target,
                                                          prop,
                                                          total_area,
                                                          current_pa,
                                                          hash)
          select fd.id,
                 $3,
                 $4,
                 $5,
                 $6,
                 $7,
                 $8,
                 coalesce(areas_cache.total_area, NULL),
                 coalesce(areas_cache.current_pa, st_area(st_transform(st_intersection(st_intersection(pa.the_geom, fd.the_geom), (
                 select st_union(wdpa.the_geom) as area
                 from wdpa where st_intersects(st_makeenvelope(
                  $9,
                  $11,
                  $10,
                  $12,
                  4326
                ), wdpa.the_geom) and wdpa.id in ($13::uuid, $14::uuid)
            )),3410))),
                 md5hash
          from features_data as fd
          inner join (
            SELECT DISTINCT feature_data_id
            FROM feature_properties_kv fpkv
            WHERE feature_id = $1
            and fpkv.key = $2
            and trim('"' FROM fpkv.value::text) = trim('"' FROM $15::text)
            ) sfpkv
            ON sfpkv.feature_data_id = fd.id


        cross join md5(
                 fd.id || '|' ||
                $9::double precision || '|' ||
                $11::double precision || '|' ||
                $10::double precision || '|' ||
                $12::double precision
                || '|' ||$13::text ||  $14::text
            ) as md5hash

          left join areas_cache on areas_cache.hash = md5hash
          where feature_id = $1
          and st_intersects(st_makeenvelope(
          $9,
          $11,
          $10,
          $12, 4326), fd.the_geom)
          returning sfp.id as id, sfp.hash as hash, sfp.total_area as total_area, sfp.current_pa as current_pa
      ), inserted_cache as (
          insert into areas_cache (hash, total_area, current_pa)
          select hash, total_area, current_pa from inserted_sfp
          on conflict do nothing
      )
      select id from inserted_sfp`,
  );
  // and
  expect(query.parameters).toEqual([
    'parent-feature-id',
    'key 1',
    'input-base-feature-id',
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
    'random value',
  ]);
});

test(`returns full query when feature is not derived`, async () => {
  // given
  const service = fixtures.getQueryService();
  // when
  const query = service.prepareStatement(
    {
      scenarioId: 'scenario-id-1',
      specificationId: 'specification-id-1',
      input: {
        baseFeatureId: 'input-base-feature-id',
        target: 1.0,
        fpf: 0.2,
        prop: 0.3,
      },
    },
    { id: 'planning-area-id', tableName: 'planning_area_table' },
    ['wdpa1', 'wdpa2'],
    { bbox: [1, 2, 3, 4] },
    null,
  );
  // then
  expect(fixPrettierQuirk(query.query)).toEqual(`
      with inserted_sfp as (
        insert into scenario_features_preparation as sfp (feature_class_id,
                                                          api_feature_id,
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
                 $6,
                 coalesce(areas_cache.total_area, st_area(st_transform(st_intersection(pa.the_geom, fd.the_geom), 3410))),
                 coalesce(areas_cache.current_pa, st_area(st_transform(st_intersection(st_intersection(pa.the_geom, fd.the_geom), (
                 select st_union(wdpa.the_geom) as area
                 from wdpa where st_intersects(st_makeenvelope(
                  $7,
                  $9,
                  $8,
                  $10,
                  4326
                ), wdpa.the_geom) and wdpa.id in ($11::uuid, $12::uuid)
            )),3410))),
                 md5hash
          from features_data as fd

          left join planning_area_table as pa on pa.id = $13

        cross join md5(
                pa.hash || '|' || fd.id || '|' ||
                $7::double precision || '|' ||
                $9::double precision || '|' ||
                $8::double precision || '|' ||
                $10::double precision
                || '|' ||$11::text ||  $12::text
            ) as md5hash

          left join areas_cache on areas_cache.hash = md5hash
          where feature_id = $1
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
      select id from inserted_sfp`);
  // and
  expect(query.parameters).toEqual([
    'input-base-feature-id',
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
  ]);
});

function fixPrettierQuirk(query: string) {
  return query.replace(/ +$/gm, '');
}
