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
  expect(fixPrettierQuirk(query.query)).toStrictEqual(
    `

        with inserted_cache as (
          insert into areas_cache (total_area, current_pa, hash)
            select st_area(st_transform(st_intersection(pa.the_geom, fd.the_geom), 3410)),
                   st_area(st_transform(st_intersection(st_intersection(pa.the_geom, fd.the_geom), protected.area),3410)),
                   md5hash
            from features_data as fd
            left join planning_area_table as pa on pa.id = $1 cross join (
           select st_union(wdpa.the_geom) as area
           from wdpa where st_intersects(st_makeenvelope(
            $4,
            $6,
            $5,
            $7,
            4326
          ), wdpa.the_geom) and wdpa.id in ($2::uuid, $3::uuid)
         ) as protected

        cross join md5(
            row (
                pa.id, fd.id,
                $4::double precision,
                $6::double precision,
                $5::double precision,
                $7::double precision
                ,$2::uuid, $3::uuid)::text
            ) as md5hash

            left join areas_cache as current_cache on current_cache.hash = md5hash
            where feature_id = $8 and current_cache.hash is null
            and st_intersects(st_makeenvelope(
            $4, $6,
            $5, $7, 4326), fd.the_geom)
            on conflict do nothing returning hash, total_area, current_pa
        )
        insert into scenario_features_preparation as sfp (feature_class_id,
                                                          scenario_id,
                                                          specification_id,
                                                          fpf,
                                                          target,
                                                          prop,
                                                          total_area,
                                                          current_pa)
        select fd.id,
               $9,
               $10,
               $11,
               $12,
               $13,

      coalesce(inserted_cache.total_area, areas_cache.total_area),
      coalesce(inserted_cache.current_pa, areas_cache.current_pa)

        from features_data as fd
            left join planning_area_table as pa on pa.id = $1

        cross join md5(
            row (
                pa.id, fd.id,
                $4::double precision,
                $6::double precision,
                $5::double precision,
                $7::double precision
                ,$2::uuid, $3::uuid)::text
            ) as md5hash

            left join areas_cache on areas_cache.hash = md5hash
            left join inserted_cache on inserted_cache.hash = md5hash
        where feature_id = $8
          and st_intersects(st_makeenvelope(
            $4,
            $6,
            $5,
            $7, 4326), fd.the_geom)
        returning sfp.id as id;
`,
  );
  // and
  expect(query.parameters).toStrictEqual([
    'planning-area-id',
    'wdpa1',
    'wdpa2',
    1,
    2,
    3,
    4,
    'base-feature-id',
    'scenario-id-1',
    'specification-id-1',
    0.2,
    1,
    0.3,
  ]);
});

test(`returns full query with no calculating area`, async () => {
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
      doNotCalculateAreas: true,
    },
    { id: 'planning-area-id', tableName: 'planning_area_table' },
    ['wdpa1', 'wdpa2'],
    { bbox: [1, 2, 3, 4] },
  );
  // then
  expect(fixPrettierQuirk(query.query)).toEqual(
    `

        insert into scenario_features_preparation as sfp (feature_class_id,
                                                          scenario_id,
                                                          specification_id,
                                                          fpf,
                                                          target,
                                                          prop,
                                                          total_area,
                                                          current_pa)
        select fd.id,
               $1,
               $2,
               $3,
               $4,
               $5,

        areas_cache.total_area,
        areas_cache.current_pa

        from features_data as fd
            left join planning_area_table as pa on pa.id = $6

        cross join md5(
            row (
                pa.id, fd.id,
                $7::double precision,
                $9::double precision,
                $8::double precision,
                $10::double precision
                ,$11::uuid, $12::uuid)::text
            ) as md5hash

            left join areas_cache on areas_cache.hash = md5hash

        where feature_id = $13
          and st_intersects(st_makeenvelope(
            $7,
            $9,
            $8,
            $10, 4326), fd.the_geom)
        returning sfp.id as id;
`,
  );
  // and
  expect(query.parameters).toStrictEqual([
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

        with inserted_cache as (
          insert into areas_cache (total_area, current_pa, hash)
            select st_area(st_transform(st_intersection(pa.the_geom, fd.the_geom), 3410)),
                   NULL,
                   md5hash
            from features_data as fd
            left join planning_area_table as pa on pa.id = $1

        cross join md5(
            row (
                pa.id, fd.id,
                $2::double precision,
                $4::double precision,
                $3::double precision,
                $5::double precision
                )::text
            ) as md5hash

            left join areas_cache as current_cache on current_cache.hash = md5hash
            where feature_id = $6 and current_cache.hash is null
            and st_intersects(st_makeenvelope(
            $2, $4,
            $3, $5, 4326), fd.the_geom)
            on conflict do nothing returning hash, total_area, current_pa
        )
        insert into scenario_features_preparation as sfp (feature_class_id,
                                                          scenario_id,
                                                          specification_id,
                                                          fpf,
                                                          target,
                                                          prop,
                                                          total_area,
                                                          current_pa)
        select fd.id,
               $7,
               $8,
               $9,
               $10,
               $11,

      coalesce(inserted_cache.total_area, areas_cache.total_area),
      coalesce(inserted_cache.current_pa, areas_cache.current_pa)

        from features_data as fd
            left join planning_area_table as pa on pa.id = $1

        cross join md5(
            row (
                pa.id, fd.id,
                $2::double precision,
                $4::double precision,
                $3::double precision,
                $5::double precision
                )::text
            ) as md5hash

            left join areas_cache on areas_cache.hash = md5hash
            left join inserted_cache on inserted_cache.hash = md5hash
        where feature_id = $6
          and st_intersects(st_makeenvelope(
            $2,
            $4,
            $3,
            $5, 4326), fd.the_geom)
        returning sfp.id as id;
`,
  );
  // and
  expect(query.parameters).toStrictEqual([
    'planning-area-id',
    1,
    2,
    3,
    4,
    'base-feature-id',
    'scenario-id-1',
    'specification-id-1',
    0.2,
    1,
    0.3,
  ]);
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

        with inserted_cache as (
          insert into areas_cache (total_area, current_pa, hash)
            select NULL,
                   st_area(st_transform(st_intersection(st_intersection(pa.the_geom, fd.the_geom), protected.area),3410)),
                   md5hash
            from features_data as fd
             cross join (
           select st_union(wdpa.the_geom) as area
           from wdpa where st_intersects(st_makeenvelope(
            $3,
            $5,
            $4,
            $6,
            4326
          ), wdpa.the_geom) and wdpa.id in ($1::uuid, $2::uuid)
         ) as protected

        cross join md5(
            row (
                 fd.id,
                $3::double precision,
                $5::double precision,
                $4::double precision,
                $6::double precision
                ,$1::uuid, $2::uuid)::text
            ) as md5hash

            left join areas_cache as current_cache on current_cache.hash = md5hash
            where feature_id = $7 and current_cache.hash is null
            and st_intersects(st_makeenvelope(
            $3, $5,
            $4, $6, 4326), fd.the_geom)
            on conflict do nothing returning hash, total_area, current_pa
        )
        insert into scenario_features_preparation as sfp (feature_class_id,
                                                          scenario_id,
                                                          specification_id,
                                                          fpf,
                                                          target,
                                                          prop,
                                                          total_area,
                                                          current_pa)
        select fd.id,
               $8,
               $9,
               $10,
               $11,
               $12,

      coalesce(inserted_cache.total_area, areas_cache.total_area),
      coalesce(inserted_cache.current_pa, areas_cache.current_pa)

        from features_data as fd


        cross join md5(
            row (
                 fd.id,
                $3::double precision,
                $5::double precision,
                $4::double precision,
                $6::double precision
                ,$1::uuid, $2::uuid)::text
            ) as md5hash

            left join areas_cache on areas_cache.hash = md5hash
            left join inserted_cache on inserted_cache.hash = md5hash
        where feature_id = $7
          and st_intersects(st_makeenvelope(
            $3,
            $5,
            $4,
            $6, 4326), fd.the_geom)
        returning sfp.id as id;
`,
  );
  // and
  expect(query.parameters).toStrictEqual([
    'wdpa1',
    'wdpa2',
    1,
    2,
    3,
    4,
    'base-feature-id',
    'scenario-id-1',
    'specification-id-1',
    0.2,
    1,
    0.3,
  ]);
});

function fixPrettierQuirk(query: string) {
  return query.replace(/ +$/gm, '');
}
