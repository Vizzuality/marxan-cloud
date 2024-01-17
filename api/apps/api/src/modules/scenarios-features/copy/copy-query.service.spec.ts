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
        with total_amounts as (
          select feature_id, SUM(amount) as total_amount from feature_amounts_per_planning_unit
          where feature_id = $3
          group by feature_id
        ),
        protected_amounts as (
          select spd.scenario_id, fappu.feature_id, SUM(fappu.amount) as protected_amount
          from scenarios_pu_data spd inner join feature_amounts_per_planning_unit fappu on fappu.project_pu_id = spd.project_pu_id
          where spd.lockin_status = 1 and fappu.feature_id = $3 and spd.scenario_id = $4
          group by spd.scenario_id, fappu.feature_id
        )
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
                 (select total_amount from total_amounts ta where ta.feature_id = $3),
                 (select protected_amount from protected_amounts pa where pa.feature_id = $3 and pa.scenario_id = $4) ,
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
                || '|' ||$15::text ||  $16::text
            ) as md5hash

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
    'random value',
    'planning-area-id',
    1,
    2,
    3,
    4,
    'wdpa1',
    'wdpa2',
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
        with total_amounts as (
          select feature_id, SUM(amount) as total_amount from feature_amounts_per_planning_unit
          where feature_id = $3
          group by feature_id
        ),
        protected_amounts as (
          select spd.scenario_id, fappu.feature_id, SUM(fappu.amount) as protected_amount
          from scenarios_pu_data spd inner join feature_amounts_per_planning_unit fappu on fappu.project_pu_id = spd.project_pu_id
          where spd.lockin_status = 1 and fappu.feature_id = $3 and spd.scenario_id = $4
          group by spd.scenario_id, fappu.feature_id
        )
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
                 (select total_amount from total_amounts ta where ta.feature_id = $3),
                 (select protected_amount from protected_amounts pa where pa.feature_id = $3 and pa.scenario_id = $4) ,
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
        with total_amounts as (
          select feature_id, SUM(amount) as total_amount from feature_amounts_per_planning_unit
          where feature_id = $3
          group by feature_id
        ),
        protected_amounts as (
          select spd.scenario_id, fappu.feature_id, SUM(fappu.amount) as protected_amount
          from scenarios_pu_data spd inner join feature_amounts_per_planning_unit fappu on fappu.project_pu_id = spd.project_pu_id
          where spd.lockin_status = 1 and fappu.feature_id = $3 and spd.scenario_id = $4
          group by spd.scenario_id, fappu.feature_id
        )
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
                 (select total_amount from total_amounts ta where ta.feature_id = $3),
                 (select protected_amount from protected_amounts pa where pa.feature_id = $3 and pa.scenario_id = $4) ,
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


        cross join md5(
                 fd.id || '|' ||
                $10::double precision || '|' ||
                $12::double precision || '|' ||
                $11::double precision || '|' ||
                $13::double precision
                || '|' ||$14::text ||  $15::text
            ) as md5hash

          where feature_id = $1
          and st_intersects(st_makeenvelope(
          $10,
          $12,
          $11,
          $13, 4326), fd.the_geom)
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
    'random value',
    1,
    2,
    3,
    4,
    'wdpa1',
    'wdpa2',
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
        with total_amounts as (
          select feature_id, SUM(amount) as total_amount from feature_amounts_per_planning_unit
          where feature_id = $1
          group by feature_id
        ),
        protected_amounts as (
          select spd.scenario_id, fappu.feature_id, SUM(fappu.amount) as protected_amount
          from scenarios_pu_data spd inner join feature_amounts_per_planning_unit fappu on fappu.project_pu_id = spd.project_pu_id
          where spd.lockin_status = 1 and fappu.feature_id = $1 and spd.scenario_id = $2
          group by spd.scenario_id, fappu.feature_id
        )
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
                 (select total_amount from total_amounts ta where ta.feature_id = $1),
                 (select protected_amount from protected_amounts pa where pa.feature_id = $1 and pa.scenario_id = $2) ,
                 md5hash
          from features_data as fd

          left join planning_area_table as pa on pa.id = $7

        cross join md5(
                pa.hash || '|' || fd.id || '|' ||
                $8::double precision || '|' ||
                $10::double precision || '|' ||
                $9::double precision || '|' ||
                $11::double precision
                || '|' ||$12::text ||  $13::text
            ) as md5hash

          where feature_id = $1
          and st_intersects(st_makeenvelope(
          $8,
          $10,
          $9,
          $11, 4326), fd.the_geom)
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
    'planning-area-id',
    1,
    2,
    3,
    4,
    'wdpa1',
    'wdpa2',
  ]);
});

function fixPrettierQuirk(query: string) {
  return query.replace(/ +$/gm, '');
}
